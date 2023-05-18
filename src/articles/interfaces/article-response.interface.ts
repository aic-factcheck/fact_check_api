import { Article } from '../schemas/article.schema';

export type ArticleResponseType = Article & {
  isSavedByUser: boolean;
};
