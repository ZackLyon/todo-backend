require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('posts todos', async() => {

      const expectation = [
        {
          'id': expect.any(Number),
          'todo': 'Mow lawn',
          'completed': false,
          'user_id': expect.any(Number)
        }
      ];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send({ todo: 'Mow lawn' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns todos', async() => {

      const expectation = [
        {
          'id': expect.any(Number),
          'todo': 'Mow lawn',
          'completed': false,
          'user_id': expect.any(Number)
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('update todo', async() => {

      const expectation = 
        {
          'id': expect.any(Number),
          'todo': 'Mows the lawn',
          'completed': true,
          'user_id': expect.any(Number)
        };

      const current = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .put(`/api/todos/${current.body[0].id}`)
        .set('Authorization', token)
        .send({ todo: 'Mows the lawn', completed: true })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
