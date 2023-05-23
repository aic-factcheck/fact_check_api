import { _ } from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from '../articles/schemas/article.schema';
import { Claim, ClaimDocument } from '../claims/schemas/claim.schema';
import { Model, Types } from 'mongoose';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';
import { UserStatType } from './types/user-stat.type';
import { Review } from '../reviews/schemas/review.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name) private savedModel: Model<SavedArticle>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getClaimsStats(userId) {
    const claims = await this.claimModel
      .aggregate([{ $match: { addedBy: userId } }])
      .group({
        _id: null,
        nPos: { $sum: '$nPositiveVotes' },
        nNeg: { $sum: '$nNegativeVotes' },
        total: { $sum: 1 },
      });

    if (
      claims.length <= 0 ||
      !_.has(claims[0], 'nPos') ||
      !_.has(claims[0], 'nNeg') ||
      !_.has(claims[0], 'total')
    ) {
      return {
        nNegativeVotes: 0,
        nPositiveVotes: 0,
        total: 0,
      };
    }

    return {
      nNegativeVotes: claims[0].nNeg,
      nPositiveVotes: claims[0].nPos,
      total: claims[0].total,
    };
  }

  async getReviewsStats(user: User) {
    const rev = await this.reviewModel
      .aggregate([{ $match: { addedBy: user._id } }])
      .group({
        _id: null,
        nPos: { $sum: '$nPositiveVotes' },
        nNeg: { $sum: '$nNegativeVotes' },
        nNeut: { $sum: '$nNeutralVotes' },
        total: { $sum: 1 },
      });

    if (
      rev.length <= 0 ||
      !_.has(rev[0], 'nPos') ||
      !_.has(rev[0], 'nNeg') ||
      !_.has(rev[0], 'total') ||
      !_.has(rev[0], 'nNeut')
    ) {
      return {
        nNeutralVotes: 0,
        nNegativeVotes: 0,
        nPositiveVotes: 0,
        total: 0,
      };
    }

    return {
      nNeutralVotes: rev[0].nNeut,
      nNegativeVotes: rev[0].nNeg,
      nPositiveVotes: rev[0].nPos,
      total: rev[0].total,
    };
  }

  async getSavedArticles(user: User) {
    const articles = await this.articleModel
      .aggregate([{ $match: { addedBy: user._id } }])
      .group({ _id: null, nSaved: { $sum: '$nSaved' }, total: { $sum: 1 } });

    if (
      articles.length <= 0 ||
      !_.has(articles[0], 'total') ||
      !_.has(articles[0], 'nSaved')
    )
      return { total: 0, nSaved: 0 };

    return { total: articles[0].total, nSaved: articles[0].nSaved };
  }

  async getUserStats(userId: Types.ObjectId | null, loggedUser: User) {
    let user: User = loggedUser;

    if (userId) {
      const foundUser = await this.userModel
        .findById(userId)
        .select('-password');
      if (!foundUser) throw new NotFoundException('User not found');
      user = foundUser;
    }

    const userStats = {
      user,
      claims: {},
      reviews: {},
      articles: {},
    };

    // const savedArticles = await getSavedArticles(uId);
    // if (!_.isNil(savedArticles)) _.assign(userStats.articles, savedArticles);
    _.assign(userStats.articles, await this.getSavedArticles(user));
    _.assign(userStats.claims, await this.getClaimsStats(user));
    _.assign(userStats.reviews, await this.getReviewsStats(user));

    return userStats;
  }

  async leaderboard(page = 1, perPage = 20, user: User | null) {
    const users: UserDocument[] = await this.userModel
      .find()
      .sort({ rating: -1 })
      .limit(perPage)
      .skip(perPage * (page - 1))
      .select('-password');
    const userIds = users.map((el) => el._id);

    const articles: ArticleDocument[] = await this.articleModel
      .aggregate([{ $match: { addedBy: { $in: userIds } } }])
      .group({ _id: '$addedBy', nArticles: { $sum: 1 } });

    const claims: ClaimDocument[] = await this.claimModel
      .aggregate([{ $match: { addedBy: { $in: userIds } } }])
      .group({ _id: '$addedBy', nClaims: { $sum: 1 } });

    const transformedUsers = users.map((x: UserDocument) => {
      return {
        ...x.toObject(),
        nArticles: 0,
        nClaims: 0,
      } as UserStatType;
    });
    const merged = _.merge(
      _.keyBy(transformedUsers, '_id'),
      _.keyBy(articles, '_id'),
      _.keyBy(claims, '_id'),
    );
    const values = _.values(merged);

    return values;
  }
}
