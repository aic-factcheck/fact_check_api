import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';

import { dbConnection, httpServer } from '../utils/setup';

describe('Claims API', () => {
  const password = 'secret';
  let article1Id: string;
  const claim1 = {
    text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    lang: 'en',
  };
  const claim2 = {
    text: 'Second claim with random text.',
    lang: 'en',
  };

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

  beforeAll(async () => {
    await dbConnection.collection('refreshtokens').deleteMany({});
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
        .expect(201);
      // adminId = userRes.body.user._id;
      // adminAccessToken = userRes.body.token.accessToken;
    });

    it('Should create articles for testing claims', async () => {
      const articleRes = await request(httpServer)
        .post('/articles')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(article1)
        .expect(201);
      article1Id = articleRes.body._id;
    });
  });

  describe('POST /articles/:articleId/claims', () => {
    it('should create a new article', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim1)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.author._id).toEqual(user1Id);
          expect(res.body.text).toEqual(claim1.text);
          // expect(res.body.nBeenVoted).toEqual(0);
          expect(res.body.nPositiveVotes).toEqual(0);
          expect(res.body.nNegativeVotes).toEqual(0);
        });
    });

    it('should create a new article', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(claim2)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          // claim2Id = res.body._id;
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.author._id).toEqual(user2Id);
          expect(res.body.text).toEqual(claim2.text);
          // expect(res.body.nBeenVoted).toEqual(0);
          expect(res.body.nPositiveVotes).toEqual(0);
          expect(res.body.nNegativeVotes).toEqual(0);
        });
    });

    it('should report error when text is not provided', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(_.omit(claim2, ['text']))
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          const { statusCode, errors } = res.body;
          expect(statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(errors).toHaveProperty('text');
        });
    });

    it('should report error when user has no auth', () => {
      return request(httpServer)
        .post('/articles')
        .set('Authorization', 'Bearer ')
        .send(_.omit(claim2, ['lang']))
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /stats', () => {
    it('should get stats of logged user', async () => {
      return request(httpServer)
        .get('/stats')
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          expect(res.body).toBeInstanceOf(Object);

          expect(res.body.user).toHaveProperty('_id');
          expect(res.body.user).toHaveProperty('email');

          expect(res.body.claims).toHaveProperty('nNegativeVotes');
          expect(res.body.claims).toHaveProperty('nPositiveVotes');
          expect(res.body.claims).toHaveProperty('total');

          expect(res.body.reviews).toHaveProperty('nNegativeVotes');
          expect(res.body.reviews).toHaveProperty('nPositiveVotes');
          expect(res.body.reviews).toHaveProperty('nNeutralVotes');
          expect(res.body.reviews).toHaveProperty('total');

          expect(res.body.articles).toHaveProperty('total');
          expect(res.body.articles).toHaveProperty('nSaved');

          expect(res.body.history).toBeInstanceOf(Array);
        });
    });
  });

  describe('GET /stats/leaderboard', () => {
    it('should get stats of logged user', async () => {
      return request(httpServer)
        .get('/stats/leaderboard')
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          expect(res.body).toBeInstanceOf(Array);

          expect(res.body[0]).toHaveProperty('_id');
          expect(res.body[0]).toHaveProperty('nArticles');
          expect(res.body[0]).toHaveProperty('nClaims');
          expect(res.body[0]).toHaveProperty('reputation');
        });
    });
  });
});
