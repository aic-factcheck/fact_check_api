import { Queue } from 'bull';
import { Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BG_ARTICLE_QUEUE_NAME } from './background-article.constants';
import { BgArticleQueueType } from './types/bg-article-queue.type';

@Injectable()
export class BackgroundArticleService {
  constructor(
    @InjectPinoLogger(BackgroundArticleService.name)
    private readonly logger: PinoLogger,
    @InjectQueue(BG_ARTICLE_QUEUE_NAME) private articleQueue: Queue,
  ) {}

  async saveReferencedArticles(
    links: string[],
    authorId: Types.ObjectId,
  ): Promise<void> {
    links.forEach(async (link) => {
      const payload: BgArticleQueueType = {
        sourceUrl: link,
        author: authorId,
      };
      const job = await this.articleQueue.add(payload);
      this.logger.info(`Job ${job.id} has been queued`);
    });
  }
}
