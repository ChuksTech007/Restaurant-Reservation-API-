import request from 'supertest';
import app from '../app';

describe('Reservation API', () => {
  it('should prevent booking a party larger than table capacity', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        restaurant_id: 1,
        customer_name: "Test User",
        party_size: 99, // Way too big
        start_time: "2026-01-15T19:00:00",
        duration_hours: 2
      });
    expect(res.status).toBe(409);
  });

  it('should prevent booking outside operating hours', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        restaurant_id: 1,
        customer_name: "Late Night",
        party_size: 2,
        start_time: "2026-01-15T03:00:00", // 3 AM
        duration_hours: 1
      });
    expect(res.status).toBe(400);
  });
});