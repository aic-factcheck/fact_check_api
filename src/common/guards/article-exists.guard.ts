import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from '../../articles/schemas/article.schema';

@Injectable()
export class DoesArticleExist implements CanActivate {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const article = await this.articleModel.findOne({ _id: params.articleId });
    if (article) {
      return true;
    }
    throw new NotFoundException('Article not found');
  }
}
