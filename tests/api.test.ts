import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('should create a new user',async () => {
    const response = await request(app)
    .post('/users')
    .set('X-User-Id','1')
    .send({
      name:'Test User',
      email:'testuser@example.com',
    });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toBe('testuser@example.com');
    // TODO: Student implementation - Part 1: Integration Testing
    // Test user creation (POST /users)
    // Test ticket creation (POST /tickets)
    // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
    // Test 404 responses for non-existent users and tickets
    // Test pagination and filtering on GET /tickets
    expect(true).toBe(true);
  });

  it('should reject ticket without X-User-Id', async () =>{
    const response = await request(app)
    .post('/tickets')
    .send({
      title: 'Unauthorized Ticket',
      description: 'This ticket should not be created'
    });
    expect(response.status).toBe(401);
  });
  it('Should return 404 for a non-existent ticket' , async () =>{
    const response = await request(app).get('/tickets/999999');
    expect(response.status).toBe(404);
  });
  it('Should support pagination on GET /tickets' , async () =>{
    const response = await request(app).get('/tickets?limit=5&offset=0',);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(5);
  });
  it('should support status filtering on GET /tickets', async () => {
    const response = await request(app).get('/tickets?status=TODO',
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    for(const ticket of response.body){
      expect(ticket.status).toBe('TODO');
    }
  });
 it('should create a new ticket', async () => {
  const userResponse = await request(app)
    .post('/users')
    .set('X-User-Id', '1')
    .send({
      name: 'Ticket Creator',
      email: 'ticketcreator@example.com',
    });

  expect(userResponse.status).toBe(201);

  const userId = userResponse.body.id;

  const response = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId))
    .send({
      title: 'Test Ticket',
      description: 'Testing ticket creation',
    });

  expect(response.status).toBe(201);
  expect(response.body.title).toBe('Test Ticket');
  expect(response.body.creator_id).toBe(userId);
});
  
});
