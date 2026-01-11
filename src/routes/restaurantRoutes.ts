import { Router } from 'express';
import db from '../database/db';

const router = Router();

// Create a Restaurant
router.post('/restaurants', (req, res) => {
  const { name, open_time, close_time } = req.body;

  // Basic validation
  if (!name || !open_time || !close_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO restaurants (name, open_time, close_time) VALUES (?, ?, ?)`;
  db.run(query, [name, open_time, close_time], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, open_time, close_time });
  });
});

// Add a Table to a Restaurant
router.post('/restaurants/:id/tables', (req, res) => {
  const restaurant_id = req.params.id;
  const { table_number, capacity } = req.body;

  if (!table_number || !capacity) {
    return res.status(400).json({ error: "Missing table details" });
  }

  const query = `INSERT INTO tables (restaurant_id, table_number, capacity) VALUES (?, ?, ?)`;
  db.run(query, [restaurant_id, table_number, capacity], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, restaurant_id, table_number, capacity });
  });
});

export default router;