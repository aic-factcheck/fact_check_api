import { _ } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Claim } from '../claims/schemas/claim.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Model } from 'mongoose';

@Injectable()
export class EvaluateClaimsService {
  private readonly logger = new Logger(EvaluateClaimsService.name);

  constructor(
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  @Cron('0 0 0 * * *') // run every mid-night
  // 1 day = 1*24*60*60000 = 1 x 24 hours x 60 minutes x 60 seconds x 1000 milliseconds
  async handleCron() {
    this.logger.debug('Claim evaluation - running');

    const now = new Date();
    const oldDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days old

    const claims = await this.claimModel.find({
      updatedAt: { $lt: oldDate },
      isRated: false,
    });

    if (!claims) {
      this.logger.debug('No claims to be evaluated...');
      return;
    }

    claims.forEach(async (claim: Claim) => {
      const reviews = await this.reviewModel.find({ claim: claim._id });
      const transRew = reviews.map((it) => {
        const nVotes = it.nNegativeVotes + it.nPositiveVotes + it.nNeutralVotes;
        const positivityRatio = it.nPositiveVotes / nVotes;
        return {
          _id: it._id,
          nPositiveVotes: it.nPositiveVotes,
          nNegativeVotes: it.nNegativeVotes,
          nNeutralVotes: it.nNeutralVotes,
          nVotes,
          positivityRatio,
          score:
            positivityRatio * 0.6 -
            0.4 * it.nNegativeVotes -
            0.1 * it.nNeutralVotes,
        };
      });

      const bestReview = _.maxBy(transRew, (x) => x.score);

      if (bestReview) {
        await this.claimModel.findByIdAndUpdate(claim._id, {
          isRated: true,
          rating: (bestReview.nPositiveVotes / bestReview.nVotes) * 100,
          updatedAt: now.toISOString(),
        });
        await this.reviewModel.findByIdAndUpdate(bestReview._id, {
          isWinner: true,
        });
      } else {
        // allow 7 more days if no winner review
        await this.claimModel.findByIdAndUpdate(claim._id, {
          updatedAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days old,
        });
      }
    });
  }
}
