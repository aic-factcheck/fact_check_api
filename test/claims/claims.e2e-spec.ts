import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { _, some } from 'lodash';

import { dbConnection, httpServer } from '../setup';

describe('Articles API', () => {
  const password = 'secret';
  let article1Id: string;
  // let adminId: string;
  // let user1Id: string;
  // let user2Id: string;
  const claim1 = {
    text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
  };
  const claim2 = {
    text: 'Second claim with random text.',
  };
  // const claim1Updated = {
  //   text: 'updated text of claim',
  // };
  let claim1Id;
  // let claim2Id;

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
          claim1Id = res.body._id;
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.addedBy._id).toEqual(user1Id);
          expect(res.body.text).toEqual(claim1.text);
          expect(res.body.nBeenVoted).toEqual(0);
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
          // expect(res.body.addedBy._id).toEqual(user2Id);
          expect(res.body.text).toEqual(claim2.text);
          expect(res.body.nBeenVoted).toEqual(0);
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

  describe('GET /articles/:articleId/claims', () => {
    it('should list claims for article', async () => {
      return request(httpServer)
        .get(`/articles/${article1Id}/claims`)
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          const includesClaim1 = some(res.body, claim1);
          const includesClaim2 = some(res.body, claim2);

          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toEqual(2);
          expect(includesClaim1).toEqual(true);
          expect(includesClaim2).toEqual(true);

          expect(res.body[0]).toHaveProperty('_id');
          expect(res.body[0]).toHaveProperty('text');
          expect(res.body[0]).toHaveProperty('addedBy');
          expect(res.body[0].nBeenVoted).toEqual(0);

          expect(res.body[0].addedBy).toHaveProperty('firstName');
          expect(res.body[0].addedBy).toHaveProperty('lastName');
          expect(res.body[0].addedBy).toHaveProperty('email');
          expect(res.body[0].addedBy).toHaveProperty('_id');
        });
    });
  });

  describe('GET /articles/:articleId/claims/:claimId', () => {
    it('should get selected claim for article', () => {
      return request(httpServer)
        .get(`/articles/${article1Id}/claims/${claim1Id}`)
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(async (res) => {
          expect(res.body).toBeInstanceOf(Object);

          expect(res.body.addedBy).toHaveProperty('firstName');
          expect(res.body.addedBy).toHaveProperty('lastName');
          expect(res.body.addedBy).toHaveProperty('email');
          expect(res.body.addedBy).toHaveProperty('_id');
          expect(res.body.nBeenVoted).toEqual(0);

          expect(res.body.article).toHaveProperty('_id');
          // expect(res.body.article._id).toEqual(article1Id);
        });
    });
  });

  // describe('PUT /articles/:articleId/claims/:claimId', () => {
  //   it('should replace claim', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .put(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(claim1Updated)
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body).to.include(claim1Updated);

  //         expect(res.body._id).toEqual(claim1Id);
  //         expect(res.body.text).toEqual(claim1Updated.text);
  //         expect(res.body.article1Id).toEqual(article1Id.toString());
  //         expect(res.body.articles).to.include(article1Id.toString());

  //         expect(res.body.addedBy._id).toEqual(user._id);
  //         expect(res.body.addedBy).toHaveProperty('firstName');
  //         expect(res.body.addedBy).toHaveProperty('lastName');
  //         expect(res.body.addedBy).toHaveProperty('email');
  //       });
  //   });

  //   it('should report error when text is not provided', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .put(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(_.omit(claim1Updated, ['text']))
  //       .expect(HttpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const { field, location, messages } = res.body.errors[0];

  //         expect(field).toEqual('text');
  //         expect(location).toEqual('body');
  //         expect(messages).to.include('"text" is required');
  //       });
  //   });

  //   it('should report error when sourceUrl is shorter than 5', async () => {
  //     const xArticles = await Article.find({});
  //     const newClaimToUpdate = {
  //       text: 'xdd',
  //     };

  //     return request(httpServer)
  //       .put(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send(newClaimToUpdate)
  //       .expect(HttpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const { field, location, messages } = res.body.errors[0];

  //         expect(field).toEqual('text');
  //         expect(location).toEqual('body');
  //         expect(messages).to.include(
  //           '"text" length must be at least 6 characters long',
  //         );
  //       });
  //   });

  //   it('should report error "Claim does not exist" when claim does not exists', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .put(`/articles/${article1Id}/claims/tenerife`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .expect(HttpStatus.NOT_FOUND)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(404);
  //         expect(res.body.message).toEqual('Claim does not exist');
  //       });
  //   });

  //   it('should report error when logged user is not the owner of claim', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .put(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user2AccessToken, { type: 'bearer' })
  //       .send(claim1Updated)
  //       .expect(HttpStatus.FORBIDDEN)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(HttpStatus.FORBIDDEN);
  //         expect(res.body.message).toEqual(
  //           'Forbidden to perform this action over selected resource.',
  //         );
  //       });
  //   });
  // });

  // describe('PATCH /articles/:articleId/claims/:claimId', () => {
  //   it('should update claim', async () => {
  //     const xArticles = await Article.find({});
  //     const text = 'new text field';

  //     return request(httpServer)
  //       .patch(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send({ text })
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.text).toEqual(text);

  //         expect(res.body._id).toEqual(claim1Id);
  //         expect(res.body.nReviews).toEqual(0);

  //         expect(res.body.text).toEqual(text);
  //         expect(res.body.article1Id).toEqual(article1Id.toString());
  //         expect(res.body.articles).to.include(article1Id.toString());

  //         expect(res.body.addedBy._id).toEqual(user._id);
  //         expect(res.body.addedBy).toHaveProperty('firstName');
  //         expect(res.body.addedBy).toHaveProperty('lastName');
  //         expect(res.body.addedBy).toHaveProperty('email');
  //       });
  //   });

  //   it('should not update claim when no parameters were given', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .patch(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .send()
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.text).toEqual('new text field'); // from previous test
  //       });
  //   });

  //   it('should report error "Claim does not exist" when claim does not exists', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .patch(`/articles/${article1Id}/claims/arrecife`)
  //       .auth(user1AccessToken, { type: 'bearer' })
  //       .expect(HttpStatus.NOT_FOUND)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(404);
  //         expect(res.body.message).toEqual('Claim does not exist');
  //       });
  //   });

  //   it('should report error when logged user is not the same as the owner', async () => {
  //     const xArticles = await Article.find({});

  //     return request(httpServer)
  //       .patch(`/articles/${article1Id}/claims/${claim1Id}`)
  //       .auth(user2AccessToken, { type: 'bearer' })
  //       .expect(HttpStatus.FORBIDDEN)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(HttpStatus.FORBIDDEN);
  //         expect(res.body.message).toEqual(
  //           'Forbidden to perform this action over selected resource.',
  //         );
  //       });
  //   });
  // });

  describe('DELETE /articles/:articleId/claims/:claimId', () => {
    it('should report error when logged user is not the same as the owner', async () => {
      return request(httpServer)
        .delete(`/articles/${article1Id}/claims/${claim1Id}`)
        .auth(user2AccessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should delete claim', async () => {
      return request(httpServer)
        .delete(`/articles/${article1Id}/claims/${claim1Id}`)
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT)
        .then(() => request(httpServer).get('/articles'))
        .then(async () => {
          expect(
            (await dbConnection.collection('claims').find().toArray()).length,
          ).toEqual(1);
        });
    });

    it('should report error "Claim does not exist" when claim does not exists', async () => {
      return request(httpServer)
        .delete(`/articles/${article1Id}/claims/6464f39798e10e49d6bead2a`)
        .auth(user1AccessToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // describe('GET /users/:userId/claims', () => {
  //   it('should list claims of user', () => {
  //     return request(httpServer)
  //       .get(`/users/${user2._id}/claims`)
  //       .auth(user2AccessToken, { type: 'bearer' })
  //       .expect(HttpStatus.OK)
  //       .then(async (res) => {
  //         const includesArticle2 = some(res.body, claim2);

  //         expect(res.body).toEqual(an)('array');
  //         expect(res.body).toEqual(1);
  //         expect(includesArticle2).toEqual(true);

  //         expect(res.body[0].addedBy._id).toEqual(user2._id);
  //         expect(res.body[0].addedBy).not.toHaveProperty('password');
  //       });
  //   });

  //   // it('should return forbidden for listing other users claims', () => {
  //   //   return request(httpServer)
  //   //     .get(`/users/${user._id}/claims`)
  //   //     .auth(user2AccessToken, { type: 'bearer' })
  //   //     .expect(HttpStatus.FORBIDDEN);
  //   // });
  // });
});
