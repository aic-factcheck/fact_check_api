import {
  BullQueueEvents,
  OnQueueEvent,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import DetectLanguage from 'detectlanguage';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BG_ARTICLE_QUEUE_NAME } from './background-article.constants';
import { BgArticleQueueType } from './types/bg-article-queue.type';
import { ExtractResponseType } from './types/extract-response.type';
import { Article, ArticleDocument } from '../articles/schemas/article.schema';
import { Model, Types } from 'mongoose';
import { normalizeArticleUrl } from '../common/helpers/normalize-article-url.helper';
import { NullableType } from '../common/types/nullable.type';

@Processor(BG_ARTICLE_QUEUE_NAME)
export class BgArticleQueueProcessor {
  private detectLanguage: DetectLanguage;
  private extractServiceHost: string;

  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(BgArticleQueueProcessor.name)
    private readonly logger: PinoLogger,
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {
    this.detectLanguage = new DetectLanguage(
      configService.getOrThrow<string>('app.langDetectionApiKey'),
    );
    this.extractServiceHost = configService.getOrThrow<string>(
      'app.extractServiceHost',
    );
  }

  @OnQueueEvent(BullQueueEvents.WAITING)
  onJobAdded(jobId: number | string) {
    this.logger.info(`Job ${jobId} has been added to the queue.`);
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onJobCompleted(job: Job) {
    this.logger.info(`Job ${job.id} has been completed!`);
  }

  @OnQueueEvent(BullQueueEvents.FAILED)
  onJobFailed(job: Job<BgArticleQueueType>) {
    this.logger.error(`Job ${job.id} has been FAILED!`);
  }

  @Process()
  async handleNewBackgroundArticle(job: Job<BgArticleQueueType>): Promise<any> {
    this.logger.info(`Start processing job ${job.id}`);
    const { sourceUrl, author } = job.data;

    const res = await this.saveOneBySourceUrl(sourceUrl, author);
    return res;
  }

  async loadText(sourceUrl: string): Promise<ExtractResponseType | undefined> {
    try {
      const response: AxiosResponse<ExtractResponseType> =
        await axios.get<ExtractResponseType>(
          `http://${this.extractServiceHost}/extract/json?url=${sourceUrl}`,
        );
      return response.data;
    } catch (e) {
      this.logger.warn(e);
    }
  }

  async detect(text: string) {
    return this.detectLanguage.detect(text);
  }

  async saveOneBySourceUrl(
    sourceUrl: string,
    authorId: Types.ObjectId,
  ): Promise<NullableType<Article>> {
    const normUrl = normalizeArticleUrl(sourceUrl);
    const article = await this.articleModel.findOne({ sourceUrl: normUrl });

    if (article) {
      this.logger.info(`Article with sourceUrl: '${normUrl}' already axists`);
      return article;
    }

    const textJson = await this.loadText(normUrl);
    if (!textJson) return null;

    const langRes = await this.detect(textJson.text);

    const createdArticle: ArticleDocument = new this.articleModel({
      author: authorId,
      title: textJson.title,
      text: textJson.text,
      categories: textJson.categories,
      sourceUrl: normUrl,
      sourceType: 'article',
      lang: langRes[0]?.language || 'en',
    });

    this.logger.info(`Article w sourceUrl: '${normUrl}' successfully created`);
    return createdArticle.save();
  }
}
