import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';
import app from '../index';

describe('Post API', () => {
  beforeAll(async () => {
    await createConnection();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  it('should create a new post', async () => {
    const newPost = {
      title: 'My First Post',
      content: 'This is my first post'
    };

    const response = await request(app)
      .post('/posts')
      .send(newPost)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Post created successfully');
    expect(response.body.post).toHaveProperty('id');
    expect(response.body.post).toHaveProperty('title', newPost.title);
    expect(response.body.post).toHaveProperty('content', newPost.content);
  });

  it('should return 400 for invalid post data', async () => {
    const invalidPost = {
      title: '', // Empty title
      userId: 1,
    };

    const response = await request(app)
      .post('/posts')
      .send(invalidPost)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('should retrieve all posts for a user', async () => {
    const response = await request(app)
      .get('/users/1/posts')
      .expect(200);

    expect(response.body).toHaveProperty('posts');
    expect(Array.isArray(response.body.posts)).toBe(true);
  });

  it('should fetch the top 3 users with the most posts and their latest comments', async () => {
    const response = await request(app)
      .get('/top-users')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeLessThanOrEqual(3); // Should return at most 3 users
  });
  
});
