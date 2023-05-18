import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';

import { dbConnection, httpServer } from '../setup';

describe('Articles API', () => {
  // let dbConnection: Connection;
  // let httpServer: any;
  // let app: any;
  // let userId: string;
  // let adminId: string;
  const password = 'secret';
  // let hash;

  const admin = {
    // _id: '64653c3e7f48c4c83571961f',
    email: 'peter.parker@admin.com',
    password,
    firstName: 'Peter',
    lastName: 'Parker',
    roles: ['user', 'admin'],
  };
  const user = {
    // _id: '64653c3e7f48c4c835719620',
    email: 'secret.since@user.com',
    password,
    firstName: 'Secret',
    lastName: 'Since',
    roles: ['user'],
  };
  let adminAccessToken: string;
  let userAccessToken: string;

  const article1 = {
    title: 'first title',
    text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
    sourceUrl: 'https://www.lipsum.com/',
    sourceType: 'article',
    lang: 'en',
  };

  const article2 = {
    title: 'SECOND title',
    text: 'Druhy clanok hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    sourceUrl: 'https://xyzabc.com',
    sourceType: 'article',
    lang: 'cz',
  };

  beforeAll(async () => {
    await dbConnection.collection('refreshtokens').deleteMany({});
    await dbConnection.collection('articles').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
  });

  describe('Setup users', () => {
    it('should preregister user', async () => {
      await request(httpServer).post('/auth/register').send(admin).expect(201);
      await request(httpServer).post('/auth/register').send(user).expect(201);
      await dbConnection
        .collection('users')
        .updateOne(
          { email: admin.email },
          { $set: { roles: ['admin', 'user'] } },
        );

      let res = await request(httpServer)
        .post('/auth/login')
        .send(admin)
        .expect(201);
      adminAccessToken = res.body.token.accessToken;

      res = await request(httpServer)
        .post('/auth/login')
        .send(user)
        .expect(201);
      userAccessToken = res.body.token.accessToken;
    });
  });

  describe('POST /articles', () => {
    it('should create a new article', () => {
      return request(httpServer)
        .post('/articles')
        .auth(adminAccessToken, { type: 'bearer' })
        .send(article1)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.addedBy._id).toEqual(user._id);
          expect(res.body.text).toEqual(article1.text);
          expect(res.body.sourceUrl).toEqual(article1.sourceUrl);
          expect(res.body.sourceType).toEqual(article1.sourceType);
          expect(res.body.lang).toEqual(article1.lang);
          expect(res.body.nSaved).toEqual(0);
        });
    });

    it('should create a new article', () => {
      return request(httpServer)
        .post('/articles')
        .auth(userAccessToken, { type: 'bearer' })
        .send(article2)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('createdAt');
          // expect(res.body.addedBy._id).toEqual(user._id);
          expect(res.body.text).toEqual(article2.text);
          expect(res.body.sourceUrl).toEqual(article2.sourceUrl);
          expect(res.body.sourceType).toEqual(article2.sourceType);
          expect(res.body.lang).toEqual(article2.lang);
          expect(res.body.nSaved).toEqual(0);
        });
    });
  });

  it('should report error when text is not provided', () => {
    return request(httpServer)
      .post('/articles')
      .auth(userAccessToken, { type: 'bearer' })
      .send(_.omit(article2, ['text']))
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .then((res) => {
        const { status, errors } = res.body;
        expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(errors).toHaveProperty('text');
        // expect(errors.text).toEqual('"text" is required');
      });
  });

  it('should report error when lang is not provided', () => {
    return request(httpServer)
      .post('/articles')
      .auth(userAccessToken, { type: 'bearer' })
      .send(_.omit(article2, ['lang']))
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .then((res) => {
        const { status, errors } = res.body;
        expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(errors).toHaveProperty('lang');
        // expect(messages).to.include('"lang" is required');
      });
  });

  it('should report error when sourceType is not provided', () => {
    return request(httpServer)
      .post('/articles')
      .auth(userAccessToken, { type: 'bearer' })
      .send(_.omit(article2, ['sourceType']))
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .then((res) => {
        const { status, errors } = res.body;
        expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(errors).toHaveProperty('sourceType');
        // expect(messages).to.include('"sourceType" is required');
      });
  });

  // describe('GET /articles', () => {
  //   it('should list articles', () => {
  //     return request(app)
  //       .get('/articles')
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.OK)
  //       .then(async (res) => {
  //         const includesArticle1 = some(res.body, article1);
  //         const includesArticle2 = some(res.body, article2);
  //         article1Id = res.body[1]._id;
  //         // article2Id = res.body[1]._id;

  //         expect(res.body).to.be.an('array');
  //         expect(res.body).to.have.lengthOf(2);
  //         expect(includesArticle1).to.be.true;
  //         expect(includesArticle2).to.be.true;

  //         expect(res.body[0].nBeenVoted).toEqual(0);

  //         expect(res.body[0].addedBy).toHaveProperty('firstName');
  //         expect(res.body[0].addedBy).toHaveProperty('lastName');
  //         expect(res.body[0].addedBy).toHaveProperty('email');
  //         expect(res.body[0].addedBy).toHaveProperty('_id');
  //       });
  //   });
  // });

  // describe('GET /articles/:articleId', () => {
  //   it('should get selected article', () => {
  //     return request(app)
  //       .get(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.OK)
  //       .then(async (res) => {
  //         expect(res.body).to.be.an('object');
  //         expect(res.body).toHaveProperty('title');
  //         expect(res.body).toHaveProperty('claims');
  //         expect(res.body).toHaveProperty('sourceUrl');
  //         expect(res.body).toHaveProperty('sourceType');
  //         expect(res.body).toHaveProperty('lang');
  //         expect(res.body).toHaveProperty('isSavedByUser');

  //         expect(res.body.addedBy).toHaveProperty('firstName');
  //         expect(res.body.addedBy).toHaveProperty('lastName');
  //         expect(res.body.addedBy).toHaveProperty('email');
  //         expect(res.body.addedBy).toHaveProperty('_id');
  //         expect(res.body.addedBy).not.toHaveProperty('password');
  //       });
  //   });
  // });

  // describe('PUT /articles/:articleId', () => {
  //   it('should replace article', async () => {
  //     const updatedArticle = {
  //       text: 'This is an updated article',
  //       sourceUrl: 'https://www.update.com/',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .put(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send(updatedArticle)
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body).to.include(updatedArticle);

  //         expect(res.body._id).toEqual(article1Id);
  //         expect(res.body.text).toEqual(updatedArticle.text);
  //         expect(res.body.title).to.not.have.property('title');
  //         expect(res.body.sourceUrl).toEqual(updatedArticle.sourceUrl);
  //         expect(res.body.sourceType).toEqual(updatedArticle.sourceType);
  //         expect(res.body.lang).toEqual(updatedArticle.lang);

  //         expect(res.body.addedBy._id).toEqual(user._id);
  //       });
  //   });

  //   it('should report error when text is not provided', async () => {
  //     const updatedArticle = {
  //       title: 'This is an updated article',
  //       sourceUrl: 'https://www.update.com/',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .put(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send(updatedArticle)
  //       .expect(HttpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const { field, location, messages } = res.body.errors[0];

  //         expect(field).toEqual('text');
  //         expect(location).toEqual('body');
  //         expect(messages).to.include('"text" is required');
  //       });
  //   });

  //   it('should report error when sourceUrl is longer than 256', async () => {
  //     const updatedArticle = {
  //       text: 'This is an updated article',
  //       sourceUrl:
  //         'https://www.update.com/asdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadadaasdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadadaasdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadada',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .put(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send(updatedArticle)
  //       .expect(HttpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const { field, location, messages } = res.body.errors[0];

  //         expect(field).toEqual('sourceUrl');
  //         expect(location).toEqual('body');
  //         expect(messages).to.include(
  //           '"sourceUrl" length must be less than or equal to 256 characters long',
  //         );
  //       });
  //   });

  //   it('should report error "Article does not exist" when article does not exists', () => {
  //     return request(app)
  //       .put('/articles/hhXddRandomSmth')
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.NOT_FOUND)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(404);
  //         expect(res.body.message).toEqual('Article does not exist');
  //       });
  //   });

  //   it('should report error when logged user is not the owner of article', async () => {
  //     const updatedArticle = {
  //       text: 'This is an updated article',
  //       sourceUrl: 'https://www.update.com/',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .put(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send(updatedArticle)
  //       .expect(HttpStatus.FORBIDDEN)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(HttpStatus.FORBIDDEN);
  //         expect(res.body.message).toEqual(
  //           'Forbidden to perform this action over selected resource.',
  //         );
  //       });
  //   });
  // });

  // describe('PATCH /articles/:articleId', () => {
  //   it('should update article', async () => {
  //     const text = 'new text field';
  //     const updatedArticle = {
  //       text: 'This is an updated article',
  //       sourceUrl: 'https://www.update.com/',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .patch(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send({ text })
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.text).toEqual(text);

  //         expect(res.body._id).toEqual(article1Id);
  //         expect(res.body.text).to.not.be.equal(updatedArticle.text);
  //         expect(res.body.sourceUrl).toEqual(updatedArticle.sourceUrl);
  //         expect(res.body.sourceType).toEqual(updatedArticle.sourceType);
  //         expect(res.body.lang).toEqual(updatedArticle.lang);
  //       });
  //   });

  //   it('should not update article when no parameters were given', async () => {
  //     const updatedArticle = {
  //       text: 'new text field',
  //       sourceUrl: 'https://www.update.com/',
  //       sourceType: 'article',
  //       lang: 'cz',
  //     };

  //     return request(app)
  //       .patch(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .send()
  //       .expect(HttpStatus.OK)
  //       .then((res) => {
  //         expect(res.body).to.include(updatedArticle);
  //       });
  //   });

  //   it('should report error "Article does not exist" when article does not exists', () => {
  //     return request(app)
  //       .patch('/articles/laspalmas')
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.NOT_FOUND)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(404);
  //         expect(res.body.message).toEqual('Article does not exist');
  //       });
  //   });

  //   it('should report error when logged user is not the same as the owner', async () => {
  //     return request(app)
  //       .patch(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.FORBIDDEN)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(HttpStatus.FORBIDDEN);
  //         expect(res.body.message).toEqual(
  //           'Forbidden to perform this action over selected resource.',
  //         );
  //       });
  //   });
  // });

  // describe('DELETE /articles', () => {
  //   it('should report error when logged user is not the same as the owner', async () => {
  //     return request(app)
  //       .delete(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.FORBIDDEN)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(HttpStatus.FORBIDDEN);
  //         expect(res.body.message).toEqual(
  //           'Forbidden to perform this action over selected resource.',
  //         );
  //       });
  //   });

  //   it('should delete article', async () => {
  //     return request(app)
  //       .delete(`/articles/${article1Id}`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.NO_CONTENT)
  //       .then(() => request(app).get('/articles'))
  //       .then(async () => {
  //         const articles = await Article.find({});
  //         expect(articles).to.have.lengthOf(1);
  //       });
  //   });

  //   it('should report error "Article does not exist" when article does not exists', () => {
  //     return request(app)
  //       .delete('/articles/laspalmas')
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.NOT_FOUND)
  //       .then((res) => {
  //         expect(res.body.code).toEqual(404);
  //         expect(res.body.message).toEqual('Article does not exist');
  //       });
  //   });
  // });

  // describe('GET /users/:userId/articles', () => {
  //   it('should list articles of user', () => {
  //     return request(app)
  //       .get(`/users/${user2._id}/articles`)
  //       .set('Authorization', `Bearer ${userAccessToken}`)
  //       .expect(HttpStatus.OK)
  //       .then(async (res) => {
  //         const includesArticle2 = some(res.body, article2);

  //         expect(res.body).to.be.an('array');
  //         expect(res.body).to.have.lengthOf(1);
  //         expect(includesArticle2).to.be.true;

  //         expect(res.body[0].addedBy._id).toEqual(user2._id);
  //       });
  //   });

  //   // it('should return forbidden for listing other users article', () => {
  //   //   return request(app)
  //   //     .get(`/users/${user._id}/articles`)
  //   //     .set('Authorization', `Bearer ${userAccessToken}`)
  //   //     .expect(HttpStatus.FORBIDDEN);
  //   // });
  // });
});
