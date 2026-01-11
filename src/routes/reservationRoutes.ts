import { Router } from 'express';
import db from '../database/db';

const router = Router();

router.post('/reservations', (req, res) => {
  const { restaurant_id, customer_name, party_size, start_time, duration_hours } = req.body;

  // 1. Calculate end_time based on duration
  const start = new Date(start_time);
  const end = new Date(start.getTime() + duration_hours * 60 * 60 * 1000);

  // 2. Check Restaurant Operating Hours
  const checkHoursQuery = `SELECT open_time, close_time FROM restaurants WHERE id = ?`;
  
  db.get(checkHoursQuery, [restaurant_id], (err, restaurant: any) => {
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const resOpen = restaurant.open_time; // e.g. "10:00"
    const resClose = restaurant.close_time; // e.g. "22:00"
    const bookingTime = start.toTimeString().substring(0, 5);

    if (bookingTime < resOpen || bookingTime > resClose) {
      return res.status(400).json({ error: "Restaurant is closed at this time" });
    }

    // 3. Find an available table that fits the party and isn't booked
    // This query looks for tables where NO reservation exists that overlaps our time
    const findTableQuery = `
      SELECT * FROM tables 
      WHERE restaurant_id = ? AND capacity >= ?
      AND id NOT IN (
        SELECT table_id FROM reservations 
        WHERE (start_time < ? AND end_time > ?)
      )
      LIMIT 1
    `;

    db.get(findTableQuery, [restaurant_id, party_size, end.toISOString(), start.toISOString()], (err, table: any) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!table) return res.status(409).json({ error: "No available tables for this time/party size" });

      // 4. Create the Reservation
      const insertQuery = `
        INSERT INTO reservations (table_id, customer_name, party_size, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(insertQuery, [table.id, customer_name, party_size, start.toISOString(), end.toISOString()], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
          reservation_id: this.lastID, 
          table_number: table.table_number,
          message: "Reservation confirmed!" 
        });
      });
    });
  });
});

// Get all reservations for a restaurant on a specific date
router.get('/restaurants/:id/reservations', (req, res) => {
  const restaurant_id = req.params.id;
  const { date } = req.query; // Expecting YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ error: "Please provide a date (YYYY-MM-DD)" });
  }

  // We use the LIKE operator to find all timestamps starting with the date string
  const query = `
    SELECT r.*, t.table_number 
    FROM reservations r
    JOIN tables t ON r.table_id = t.id
    WHERE t.restaurant_id = ? AND r.start_time LIKE ?
    ORDER BY r.start_time ASC
  `;

  db.all(query, [restaurant_id, `${date}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

export default router;