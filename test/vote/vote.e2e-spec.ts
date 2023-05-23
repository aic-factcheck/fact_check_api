import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

import { dbConnection, httpServer } from '../utils/setup';
import { Types } from 'mongoose';

describe('Votes API', () => {
  const password = 'secret';
  let article1Id: string;
  // let article2Id: string;
  // let adminId: string;
  // let user1Id: string;
  // let user2Id: string;
  let claim1Id;
  let claim2Id;
  let review1Id;
  let review2Id;

  const admin = {
    email: 'peter.parker@admin.com',
    password,
    firstName: 'Peter',
    lastName: 'Parker',
    roles: ['user', 'admin'],
  };
  const user1 = {
    email: 'secret.since@user.com',
    password,
    firstName: 'Secret',
    lastName: 'Since',
    roles: ['user'],
  };
  const user2 = {
    email: 'lukas.panda@user.com',
    password,
    firstName: 'Lukas',
    lastName: 'Panda',
    roles: ['user'],
  };

  // let adminAccessToken: string;
  let user1AccessToken: string;
  let user2AccessToken: string;

  const article1 = {
    title: 'first title',
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    sourceUrl: 'https://www.lipsum.com/',
    sourceType: 'article',
    lang: 'en',
  };
  const article2 = {
    title: 'Second article',
    text: 'Lorem Ipsum is second article. Lorem Ipsum has been the industry',
    sourceUrl: 'https://www.lipsum.sk/',
    sourceType: 'article',
    lang: 'cz',
  };
  const claim1 = {
    text: 'Lorem Ipsum has been the industry',
    lang: 'cz',
    nPositiveVotes: 0,
    nNegativeVotes: 0,
  };
  const claim2 = {
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    lang: 'en',
    nPositiveVotes: 0,
    nNegativeVotes: 0,
  };
  const review1 = {
    text: 'Prvy review hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    vote: 'TRUE',
    links: ['www.google.com'],
    lang: 'en',
    nPositiveVotes: 0,
    nNegativeVotes: 0,
    nNeutralVotes: 0,
  };
  const review2 = {
    text: 'Second review with random text.',
    vote: 'PARTIALLY_TRUE',
    links: ['www.google.com', 'www.bing.sk'],
    lang: 'cz',
    nPositiveVotes: 0,
    nNegativeVotes: 0,
    nNeutralVotes: 0,
  };
  const positiveVote = {
    rating: 1,
  };
  const negVote = {
    rating: -1,
  };
  const neutralVote = {
    rating: 0,
  };

  beforeAll(async () => {
    await dbConnection.collection('refreshtokens').deleteMany({});
    await dbConnection.collection('reviews').deleteMany({});
    await dbConnection.collection('claims').deleteMany({});
    await dbConnection.collection('articles').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
  });

  describe('Setup users - Auth APi', () => {
    it('Should register users for tests', async () => {
      let userRes = await request(httpServer)
        .post('/auth/register')
        .send(user1)
        .expect(201);
      user1AccessToken = userRes.body.token.accessToken;
      // user1Id = userRes.body.user._id;

      userRes = await request(httpServer)
        .post('/auth/register')
        .send(user2)
        .expect(201);
      user2AccessToken = userRes.body.token.accessToken;
      // user2Id = userRes.body.user._id;

      await request(httpServer).post('/auth/register').send(admin).expect(201);
      await dbConnection
        .collection('users')
        .updateOne(
          { email: admin.email },
          { $set: { roles: ['admin', 'user'] } },
        );

      userRes = await request(httpServer)
        .post('/auth/login')
        .send(admin)
        .expect(HttpStatus.CREATED);
      // adminId = userRes.body.user._id;
      // adminAccessToken = userRes.body.token.accessToken;
    });

    it('Should create article for testing claims', async () => {
      let articleRes = await request(httpServer)
        .post('/articles')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(article1)
        .expect(HttpStatus.CREATED);
      article1Id = articleRes.body._id;
      articleRes = await request(httpServer)
        .post('/articles')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(article2)
        .expect(HttpStatus.CREATED);
    });

    it('Should create claims for testing claims', async () => {
      let claimRes = await request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim1)
        .expect(HttpStatus.CREATED);
      claim1Id = claimRes.body._id;
      claimRes = await request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim2)
        .expect(HttpStatus.CREATED);
      claim2Id = claimRes.body._id;
    });

    it('should create a new article', async () => {
      await request(httpServer)
        .post(`/articles/${article1Id}/claims/${claim1Id}/reviews`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(review1)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          review1Id = res.body._id;
        });
      await request(httpServer)
        .post(`/articles/${article1Id}/claims/${claim1Id}/reviews`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(review2)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          review2Id = res.body._id;
        });
    });
  });

  describe('POST /vote?claimId=', () => {
    it('Only articleId/claimId/reviewId or userId can be used for voting', () => {
      return request(httpServer)
        .post(`/vote?otherId=${claim2Id}`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('user1 should vote for an claim1', async () => {
      return request(httpServer)
        .post(`/vote?id=${claim1Id}&type=CLAIM`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nPositiveVotes).toEqual(claim1.nPositiveVotes + 1);

          const claim = await dbConnection
            .collection('claims')
            .findOne(new Types.ObjectId(claim1Id));
          expect(claim?.nPositiveVotes).toEqual(claim1.nPositiveVotes + 1);
          expect(claim?.nNegativeVotes).toEqual(claim1.nNegativeVotes);
          claim1.nPositiveVotes += 1;
        });
    });

    it('user1 should vote for an claim2', async () => {
      return request(httpServer)
        .post(`/vote?id=${claim2Id}&type=CLAIM`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nPositiveVotes).toEqual(claim2.nPositiveVotes + 1);

          const claim = await dbConnection
            .collection('claims')
            .findOne(new Types.ObjectId(claim2Id));
          expect(claim?.nPositiveVotes).toEqual(claim2.nPositiveVotes + 1);
          expect(claim?.nNegativeVotes).toEqual(claim2.nNegativeVotes);
          claim2.nPositiveVotes += 1;
        });
    });

    it('user2 should vote for an claim1', async () => {
      return request(httpServer)
        .post(`/vote?id=${claim1Id}&type=CLAIM`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nPositiveVotes).toEqual(claim1.nPositiveVotes + 1);

          const claim = await dbConnection
            .collection('claims')
            .findOne(new Types.ObjectId(claim1Id));
          expect(claim?.nPositiveVotes).toEqual(claim1.nPositiveVotes + 1);
          expect(claim?.nNegativeVotes).toEqual(claim1.nNegativeVotes);
          claim1.nPositiveVotes += 1;
        });
    });

    it('user2 should give negative vote for claim2', async () => {
      return request(httpServer)
        .post(`/vote?id=${claim2Id}&type=CLAIM`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(negVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nNegativeVotes).toEqual(claim2.nNegativeVotes + 1);

          const claim = await dbConnection
            .collection('claims')
            .findOne(new Types.ObjectId(claim2Id));
          expect(claim?.nPositiveVotes).toEqual(claim2.nPositiveVotes);
          expect(claim?.nNegativeVotes).toEqual(claim2.nNegativeVotes + 1);
          claim2.nNegativeVotes += 1;
        });
    });

    it('should return not_found when id does not exist', () => {
      return request(httpServer)
        .post('/vote?id=41224d776a326fb40f010000&type=CLAIM')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return error when rating is not specified', () => {
      return request(httpServer)
        .post(`/vote?id=${claim2Id}&type=CLAIM`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send({ text: 'hehe' })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          const { statusCode, errors } = res.body;
          expect(statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(errors).toHaveProperty('rating');
        });
    });

    it('should return error no neither article/claim/review or userId is specified', () => {
      return request(httpServer)
        .post('/vote?id=&type=CLAIM')
        .auth(user1AccessToken, { type: 'bearer' })
        .send({ text: 'hehe' })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('POST /vote?reviewId=', () => {
    it('user1 should give neutral vote for an review1', async () => {
      return request(httpServer)
        .post(`/vote?id=${review1Id}&type=REVIEW`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(neutralVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nNeutralVotes).toEqual(review1.nNeutralVotes + 1);
          const review = await dbConnection
            .collection('reviews')
            .findOne(new Types.ObjectId(review1Id));
          expect(review?.nPositiveVotes).toEqual(review1.nPositiveVotes);
          expect(review?.nNeutralVotes).toEqual(review1.nNeutralVotes + 1);
          expect(review?.nNegativeVotes).toEqual(review1.nNegativeVotes);

          // expect(review).toHaveProperty('userVote');
          // expect(review?.userVote).toEqual(neutralVote.rating);

          review1.nNeutralVotes += 1; // update local review obj
        });
    });

    it('user1 should give negative vote for an review2', async () => {
      return request(httpServer)
        .post(`/vote?id=${review2Id}&type=REVIEW`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(negVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nNegativeVotes).toEqual(review2.nNegativeVotes + 1);
          const review = await dbConnection
            .collection('reviews')
            .findOne(new Types.ObjectId(review2Id));
          expect(review?.nPositiveVotes).toEqual(review2.nPositiveVotes);
          expect(review?.nNeutralVotes).toEqual(review2.nNeutralVotes);
          expect(review?.nNegativeVotes).toEqual(review2.nNegativeVotes + 1);

          // expect(review).toHaveProperty('userVote');
          // expect(review?.userVote).toEqual(negVote.rating);

          review2.nNegativeVotes += 1;
        });
    });

    it('user2 should give neutral vote for an review1', async () => {
      return request(httpServer)
        .post(`/vote?id=${review1Id}&type=REVIEW`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(neutralVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nNeutralVotes).toEqual(review1.nNeutralVotes + 1);
          const review = await dbConnection
            .collection('reviews')
            .findOne(new Types.ObjectId(review1Id));
          expect(review?.nPositiveVotes).toEqual(review1.nPositiveVotes);
          expect(review?.nNeutralVotes).toEqual(review1.nNeutralVotes + 1);
          expect(review?.nNegativeVotes).toEqual(review1.nNegativeVotes);

          review1.nNeutralVotes += 1;
        });
    });

    it('user2 should give positive vote for review2', async () => {
      return request(httpServer)
        .post(`/vote?id=${review2Id}&type=REVIEW`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(positiveVote)
        .expect(HttpStatus.CREATED)
        .then(async (res) => {
          expect(res.body.nPositiveVotes).toEqual(review2.nPositiveVotes + 1);
          const review = await dbConnection
            .collection('reviews')
            .findOne(new Types.ObjectId(review2Id));
          expect(review?.nPositiveVotes).toEqual(review2.nPositiveVotes + 1);
          expect(review?.nNegativeVotes).toEqual(review2.nNegativeVotes);
          // expect(review).toHaveProperty('userVote');
          // expect(review?.userVote).toEqual(positiveVote.rating);

          review2.nPositiveVotes += 1;
        });
    });

    it('should return not_found when id does not exist', () => {
      return request(httpServer)
        .post('/vote?id=41224d776a326fb40f010090&type=REVIEW')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(neutralVote)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return error when rating is not specified', () => {
      return request(httpServer)
        .post(`/vote?id=${review2Id}&type=REVIEW`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send({ text: 'hehe' })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          const { statusCode, errors } = res.body;
          expect(statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(errors).toHaveProperty('rating');
        });
    });
  });

  // describe('POST /vote?articleId=', () => {
  //   it('user1 should vote for an article1', async () => {
  //     return request(httpServer)
  //       .post(`/vote?articleId=${article1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(positiveVote)
  //       .expect(HttpStatus.CREATED)
  //       .then((res) => {
  //         expect(res.body.nPositiveVotes).toEqual(article1.nPositiveVotes + 1);
  //       });
  //   });

  //   it('user1 should vote for the article2', () => {
  //     return request(httpServer)
  //       .post(`/vote?articleId=${article2._id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(positiveVote)
  //       .expect(HttpStatus.CREATED)
  //       .then((res) => {
  //         expect(res.body.nPositiveVotes).toEqual(article2.nPositiveVotes + 1);
  //       });
  //   });

  //   it('user2 should vote for the article1', () => {
  //     return request(httpServer)
  //       .post(`/vote?articleId=${article1Id}`)
  //       .auth(user2AccessToken, { type: 'bearer' })
  //       .send(positiveVote)
  //       .expect(HttpStatus.CREATED)
  //       .then((res) => {
  //         expect(res.body.nPositiveVotes).toEqual(article1.nPositiveVotes + 1);
  //       });
  //   });

  //   it('should not update nBeenVoted if user1 votes again for claim1', () => {
  //     return request(httpServer)
  //       .post(`/vote?id=${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(negVote)
  //       .expect(HttpStatus.CREATED)
  //       .then((res) => {
  //         expect(res.body.nBeenVoted).toEqual(claim1.nBeenVoted);
  //         expect(res.body.nNegativeVotes).toEqual(claim1.nNegativeVotes + 1);
  //         expect(res.body.nPositiveVotes).toEqual(claim1.nPositiveVotes - 1);
  //         claim1.nNegativeVotes += 1;
  //         claim1.nPositiveVotes -= 1;
  //       });
  //   });

  //   it('should return not found when id does not exist', () => {
  //     return request(httpServer)
  //       .post('/vote?articleId=41224d776a326fb40f010000') // specified claimId but looking for articleId
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(positiveVote)
  //       .expect(HttpStatus.NOT_FOUND);
  //   });

  //   it('should return error when rating is not specified', () => {
  //     return request(httpServer)
  //       .post(`/vote?articleId=${article2._id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send({ text: 'hehe' })
  //       .expect(HttpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const { field, location, messages } = res.body.errors[0];

  //         expect(field).toEqual('rating');
  //         expect(location).toEqual('body');
  //         expect(messages).to.include('"rating" is required');
  //       });
  //   });
  // });

  // describe('POST /vote?userId=', () => {
  //   it('user1 should vote for user2', async () => {
  //     return request(httpServer)
  //       .post(`/vote?userId=${user2._id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(positiveVote)
  //       .expect(HttpStatus.CREATED)
  //       .then((res) => {
  //         expect(res.body.nBeenVoted).toEqual(1);
  //       });
  //   });
  // });
});
