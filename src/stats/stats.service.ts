import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { Model, Types } from 'mongoose';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';
import { UserStatType } from './types/user-stat.type';
import { Review } from '../reviews/schemas/review.schema';
import { Reputation } from '../game/schemas/reputation.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name) private savedModel: Model<SavedArticle>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Reputation.name) private repModel: Model<Reputation>,
  ) {}

  private async getStats(
    model: Model<any>,
    match: any,
    group: any,
    defaults: any,
  ) {
    const stats = await model.aggregate([{ $match: match }]).group(group);
    if (stats.length === 0) {
      return defaults;
    }
    return { ...defaults, ...stats[0] };
  }

  async getClaimsStats(user: User) {
    return this.getStats(
      this.claimModel,
      { author: user._id },
      {
        _id: null,
        nPos: { $sum: '$nPositiveVotes' },
        nNeg: { $sum: '$nNegativeVotes' },
        total: { $sum: 1 },
      },
      {
        nNegativeVotes: 0,
        nPositiveVotes: 0,
        total: 0,
      },
    );
  }

  async getReviewsStats(user: User) {
    return this.getStats(
      this.reviewModel,
      { author: user._id },
      {
        _id: null,
        nPos: { $sum: '$nPositiveVotes' },
        nNeg: { $sum: '$nNegativeVotes' },
        nNeut: { $sum: '$nNeutralVotes' },
        total: { $sum: 1 },
      },
      {
        nNeutralVotes: 0,
        nNegativeVotes: 0,
        nPositiveVotes: 0,
        total: 0,
      },
    );
  }

  async getSavedArticles(user: User) {
    return this.getStats(
      this.articleModel,
      { author: user._id },
      {
        _id: null,
        nSaved: { $sum: '$nSaved' },
        total: { $sum: 1 },
      },
      {
        total: 0,
        nSaved: 0,
      },
    );
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
      claims: await this.getClaimsStats(user),
      reviews: await this.getReviewsStats(user),
      articles: await this.getSavedArticles(user),
      history: loggedUser
        ? await this.repModel.find({ user: loggedUser._id })
        : [],
    };
    return userStats;
  }

  async leaderboard(page = 1, perPage = 20): Promise<UserStatType[]> {
    const users: UserDocument[] = await this.userModel
      .find()
      .sort({ reputation: -1 })
      .limit(perPage)
      .skip(perPage * (page - 1));

    const userIds = users.map((user) => user._id);

    const userMap = new Map<string, UserStatType>(
      users.map((user) => [
        user._id.toString(),
        { ...user.toObject(), nArticles: 0, nClaims: 0 } as UserStatType,
      ]),
    );

    const [articles, claims] = await Promise.all([
      this.articleModel
        .aggregate([{ $match: { author: { $in: userIds } } }])
        .group({ _id: '$author', nArticles: { $sum: 1 } }),

      this.claimModel
        .aggregate([{ $match: { author: { $in: userIds } } }])
        .group({ _id: '$author', nClaims: { $sum: 1 } }),
    ]);

    articles.forEach(({ _id, nArticles }) => {
      const user = userMap.get(_id.toString());
      if (user) user.nArticles = nArticles;
    });

    claims.forEach(({ _id, nClaims }) => {
      const user = userMap.get(_id.toString());
      if (user) user.nClaims = nClaims;
    });

    return Array.from(userMap.values());
  }
}
