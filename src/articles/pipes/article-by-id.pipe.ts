import {
  ArgumentMetadata,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Article } from '../schemas/article.schema';
import { ArticlesService } from '../articles.service';

export class ArticleByIdPipe
  implements PipeTransform<string, Promise<Article>>
{
  constructor(private readonly articlesService: ArticlesService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: string, metadata: ArgumentMetadata): Promise<Article> {
    const article = await this.articlesService.findByQuery({ _id: value });
    if (!article) {
      throw new NotFoundException(`Article #${value} not found`);
    }
    return article;
  }
}
