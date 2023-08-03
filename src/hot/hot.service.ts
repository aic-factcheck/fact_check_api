import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from '../articles/schemas/article.schema';
import { Claim, ClaimDocument } from '../claims/schemas/claim.schema';
import { Model } from 'mongoose';
import {
  SavedArticle,
  SavedArticleDocument,
} from '../saved-articles/schemas/saved-article.schema';
import { SortByEnum, getSortByObject } from './enums/sort-by.enum';
import { DurationLimitEnum, getDurationQuery } from './enums/duration.enum';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { mergeClaimsWithReviews } from '../common/helpers/merge-claims-reviews.helper';

@Injectable()
export class HotService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name) private savedModel: Model<SavedArticle>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  findUsers(page = 1, perPage = 20): Promise<User[]> {
    return this.userModel
      .find({})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ nPositiveVotes: 'desc' });
  }

  async findArticles(
    page = 1,
    perPage = 20,
    loggedUser: User | null,
  ): Promise<Article[]> {
    const articlesPromise: Promise<ArticleDocument[]> = this.articleModel
      .find({})
      .sort({ nPositiveVotes: 'desc' })
      .skip(perPage * (page - 1))
      .limit(perPage);

    const savedArticlesPromise: Promise<SavedArticleDocument[]> = loggedUser
      ? this.savedModel
          .find({
            author: loggedUser._id,
          })
          .distinct('articleId')
      : Promise.resolve([]);

    const [articles, savedArticles] = await Promise.all([
      articlesPromise,
      savedArticlesPromise,
    ]);

    // convert savedArticles array into set for searching in O(1) instead O(n)
    const savedArticlesSet = new Set(savedArticles.map(String));

    return articles.map((article) => ({
      ...article.toObject(),
      isSavedByUser: savedArticlesSet.has(String(article._id)),
    }));
  }

  async findClaims(
    page = 1,
    perPage = 20,
    loggedUser: User | null,
    sortBy: SortByEnum,
    duration: DurationLimitEnum,
  ) {
    const claimsPromise: Promise<ClaimDocument[]> = this.claimModel
      .find(getDurationQuery(duration))
      .sort(getSortByObject(sortBy))
      .skip(perPage * (page - 1))
      .limit(perPage);

    const userReviewPromise: Promise<ReviewDocument[]> = loggedUser
      ? this.reviewModel.find({ author: loggedUser._id }).lean()
      : Promise.resolve([]);

    const [claims, userReviews] = await Promise.all([
      claimsPromise,
      userReviewPromise,
    ]);

    return mergeClaimsWithReviews(claims, userReviews);
  }
}
