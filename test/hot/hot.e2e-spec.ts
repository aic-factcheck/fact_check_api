import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { _, some } from 'lodash';

import { dbConnection, httpServer } from '../utils/setup';

describe('HOT API', () => {
  const password = 'secret';
  let article1Id: string;
  let article2Id: string;
  // let adminId: string;
  // let user1Id: string;
  // let user2Id: string;
  let claim1Id;
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
  };
  const claim2 = {
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    lang: 'en',
  };
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
      const claimRes = await request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim1)
        .expect(HttpStatus.CREATED);
      claim1Id = claimRes.body._id;
      await request(httpServer)
        .post(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .send(claim2)
        .expect(HttpStatus.CREATED);
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
          review1Id = res.body._id;
        });
    });
  });

  describe('GET /hot/claims', () => {
    it('should list hottest claims', () => {
      return (
        request(httpServer)
          .get('/hot/claims?duration=WEEK&sortBy=POSITIVE_VOTES_DESC')
          .auth(user1AccessToken, { type: 'bearer' })
          // .expect(HttpStatus.OK)
          .then(async (res) => {
            const includesClaim1 = some(
              res.body,
              _.omit(claim1, ['author', '_id']),
            );
            const includesClaim2 = some(
              res.body,
              _.omit(claim2, ['author', '_id']),
            );

            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toEqual(2);
            expect(includesClaim1).toEqual(true);
            expect(includesClaim2).toEqual(true);
          })
      );
    });
  });

  describe('GET /hot/articles', () => {
    it('should list hottest articles', () => {
      return request(httpServer)
        .get('/hot/articles?page=1&perPage=20')
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          const includesArticle1 = some(res.body, _.omit(article1, ['author']));
          const includesArticle2 = some(res.body, _.omit(article2, ['author']));

          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toEqual(2);
          expect(includesArticle1).toEqual(true);
          expect(includesArticle2).toEqual(true);
          // expect(res.body[0]).toHaveProperty('isSavedByUser');
        });
    });
  });

  describe('GET /hot/users', () => {
    it('should list hottest users?page=1&perPage=20', () => {
      return request(httpServer)
        .get('/hot/users')
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          // const includesUser1 = some(res.body, _.omit(user1, ['_id']));
          // const includesUser2 = some(res.body, _.omit(user2, ['_id']));
          // const includesAdmin = some(res.body, _.omit(admin, ['_id']));

          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toEqual(3);
          // expect(includesUser1).toEqual(true);
          // expect(includesUser2).toEqual(true);
          // expect(includesAdmin).toEqual(true);
        });
    });
  });
});
