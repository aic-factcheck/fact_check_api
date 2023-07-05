import { _ } from 'lodash';
import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { Claim, ClaimDocument } from '../claims/schemas/claim.schema';
import { Model } from 'mongoose';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';
import { SortByEnum, getSortByObject } from './enums/sort-by.enum';
import { DurationLimitEnum, getDurationQuery } from './enums/duration.enum';
import { Review } from '../reviews/schemas/review.schema';
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
    user: User | null,
  ): Promise<Article[]> {
    const articles = await this.articleModel
      .find({})
      .sort({ nPositiveVotes: 'desc' })
      .skip(perPage * (page - 1))
      .limit(perPage);

    let savedArticles = [];

    if (user) {
      savedArticles = await this.savedModel
        .find({
          author: user._id,
        })
        .distinct('articleId');
    }

    return articles.map((it) => {
      return _.assign(it, { isSavedByUser: _.some(savedArticles, it._id) });
    });
  }

  async findClaims(
    page = 1,
    perPage = 20,
    loggedUser: User | null,
    sortBy: SortByEnum,
    duration: DurationLimitEnum,
  ) {
    let userReviews;
    if (loggedUser) {
      userReviews = await this.reviewModel
        .find({ author: loggedUser._id })
        .lean();
    }

    const claims: ClaimDocument[] = await this.claimModel
      .find(_.merge({}, getDurationQuery(duration)))
      .sort(getSortByObject(sortBy))
      .skip(perPage * (page - 1))
      .limit(perPage);

    return mergeClaimsWithReviews(claims, userReviews);
  }
}
