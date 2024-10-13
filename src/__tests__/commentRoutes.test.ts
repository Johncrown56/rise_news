import app from '../index';
import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';

describe('Comment API', () => {
  beforeAll(async () => {
    await createConnection();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  it('should add a comment to a post', async () => {
    const newComment = {
      content: 'This is a new comment',
      postId: 1,
    };

    const response = await request(app)
      .post('/posts/1/comments')
      .send(newComment)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Comment added successfully');
    expect(response.body.comment).toHaveProperty('id');
    expect(response.body.comment).toHaveProperty('content', newComment.content);
  });

  it('should return 400 for invalid comment data', async () => {
    const invalidComment = {
      content: '', // Empty content
      postId: 1,
    };

    const response = await request(app)
      .post('/posts/1/comments')
      .send(invalidComment)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('should retrieve comments for a post', async () => {
    const response = await request(app)
      .get('/posts/1/comments')
      .expect(200);

    expect(response.body).toHaveProperty('comments');
    expect(Array.isArray(response.body.comments)).toBe(true);
  });
});
