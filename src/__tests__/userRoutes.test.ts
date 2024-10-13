import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';
import app from '../index';

describe('User API', () => {
  beforeAll(async () => {
    // Establish a connection to the test database
    await createConnection();
  });

  afterAll(async () => {
    // Close the database connection
    await getConnection().close();
  });

  it('should create a new user', async () => {
    const newUser = {
      firstName: 'John',	
      lastName: 'Adepoju',
      email: 'adepojujohn56@gmail.com',
      password: 'John@1234',
    };

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('firstName', newUser.firstName);
    expect(response.body.user).toHaveProperty('lastName', newUser.lastName);
    expect(response.body.user).toHaveProperty('email', newUser.email);
  });

  it('should return 400 for invalid user data', async () => {
    const invalidUser = {
      firstName: '', // Missing first name
      email: 'john@testing.com',
      password: 'Password@123',
    };

    const response = await request(app)
      .post('/users')
      .send(invalidUser)
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });
});
