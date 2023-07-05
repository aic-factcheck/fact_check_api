import { _ } from 'lodash';
import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { Article } from '../articles/schemas/article.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';
import { NullableType } from '../common/types/nullable.type';
import { Review } from '../reviews/schemas/review.schema';
import { ClaimResponseType } from '../claims/types/claim-response.type';
import { mergeClaimsWithReviews } from '../common/helpers/merge-claims-reviews.helper';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name) private savedModel: Model<SavedArticle>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  findUsers(
    page = 1,
    perPage = 20,
    text: string,
  ): Promise<NullableType<User[]>> {
    return this.userModel
      .find({
        $text: {
          $search: text,
          $diacriticSensitive: false,
        },
      })
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async findClaims(
    page = 1,
    perPage = 20,
    text: string,
    loggedUser: User | null,
  ): Promise<NullableType<ClaimResponseType[]>> {
    let userReviews;
    if (loggedUser) {
      userReviews = await this.reviewModel
        .find({ author: loggedUser._id })
        .lean();
    }

    const claims = await this.claimModel
      .find({ $text: { $search: text } })
      .limit(perPage)
      .skip(perPage * (page - 1));

    return mergeClaimsWithReviews(claims, userReviews);
  }

  async findArticles(
    page = 1,
    perPage = 20,
    text: string,
    loggedUser: User | null,
  ): Promise<NullableType<Article[]>> {
    const articles = await this.articleModel
      .find(
        // TODO similarity index
        { $text: { $search: text } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .populate('author')
      .limit(perPage)
      .skip(perPage * (page - 1));

    const savedArticles = await this.savedModel
      .find({ author: loggedUser?._id })
      .distinct('articleId');
    articles.forEach((x) =>
      _.assign(x, { isSavedByUser: _.some(savedArticles, x._id) }),
    );
    return articles;
  }
}
