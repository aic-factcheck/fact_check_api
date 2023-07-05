import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';

import { dbConnection, httpServer } from '../utils/setup';

describe('Reviews API', () => {
  const password = 'secret';
  let article1Id: string;
  // let adminId: string;
  // let user1Id: string;
  // let user2Id: string;
  const review1 = {
    text: 'Prvy review hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    vote: 'TRUE',
    links: ['www.google.com'],
    lang: 'en',
  };
  const review2 = {
    text: 'Second review with random text.',
    vote: 'PARTIALLY_TRUE',
    links: ['www.google.com', 'www.bing.sk'],
    lang: 'cz',
  };
  let claimId;

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

  const article = {
    title: 'first title',
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    sourceUrl: 'https://www.lipsum.com/',
    sourceType: 'article',
    lang: 'en',
  };

  const claim = {
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    lang: 'en',
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
        .expect(201);
      // adminId = userRes.body.user._id;
      // adminAccessToken = userRes.body.token.accessToken;
    });

    it('Should create article for testing claims', async () => {
      const articleRes = await request(httpServer)
        .post('/articles')
        .auth(user1AccessToken, { type: 'bearer' })
        .send(article)
        .expect(201);
      article1Id = articleRes.body._id;
    });

    it('Should create claims for testing claims', async () => {
      const articleRes = await request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim)
        .expect(201);
      claimId = articleRes.body._id;
    });
  });

  describe('POST /articles/:articleId/claims', () => {
    it('should create a new article', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims/${claimId}/reviews`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(review1)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.author._id).toEqual(user1Id);
          expect(res.body.text).toEqual(review1.text);
          // expect(res.body.nBeenVoted).toEqual(0);
          expect(res.body.nPositiveVotes).toEqual(0);
          expect(res.body.nNegativeVotes).toEqual(0);
          expect(res.body.nNeutralVotes).toEqual(0);
        });
    });

    it('should create a new article', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims/${claimId}/reviews`)
        .auth(user2AccessToken, { type: 'bearer' })
        .send(review2)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.author._id).toEqual(user2Id);
          expect(res.body.text).toEqual(review2.text);
          // expect(res.body.nBeenVoted).toEqual(0);
          expect(res.body.nPositiveVotes).toEqual(0);
          expect(res.body.nNegativeVotes).toEqual(0);
          expect(res.body.nNeutralVotes).toEqual(0);
        });
    });

    it('should report error when text is not provided', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims/${claimId}/reviews`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(_.omit(review1, ['text']))
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((res) => {
          const { statusCode, errors } = res.body;
          expect(statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(errors).toHaveProperty('text');
        });
    });

    it('should report error when user has no auth', () => {
      return request(httpServer)
        .post(`/articles/${article1Id}/claims/${claimId}/reviews`)
        .set('Authorization', 'Bearer ')
        .send(_.omit(review1, ['lang']))
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
