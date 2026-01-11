import { Router } from 'express';
import db from '../database/db';

const router = Router();

router.get('/restaurants/:id/availability', (req, res) => {
  const restaurant_id = req.params.id;
  const { date, party_size } = req.query; // Date format: YYYY-MM-DD

  if (!date || !party_size) {
    return res.status(400).json({ error: "Missing date or party_size" });
  }

  // 1. Get restaurant hours
  db.get(`SELECT open_time, close_time FROM restaurants WHERE id = ?`, [restaurant_id], (err, restaurant: any) => {
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const openHour = parseInt(restaurant.open_time.split(':')[0]);
    const closeHour = parseInt(restaurant.close_time.split(':')[0]);
    const slots = [];

    // 2. Query all tables that can fit the party
    const tableQuery = `SELECT id FROM tables WHERE restaurant_id = ? AND capacity >= ?`;
    
    db.all(tableQuery, [restaurant_id, party_size], (err, tables) => {
      if (tables.length === 0) return res.json({ available_slots: [] });

      const tableIds = tables.map((t: any) => t.id).join(',');

      // 3. For each hour the restaurant is open, check if any of those tables are free
      // We'll use a Promise-based approach to check all slots
      const checkSlots = async () => {
        const availableSlots = [];

        for (let hour = openHour; hour < closeHour; hour++) {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const slotStart = `${date}T${timeString}:00Z`;
          // Assume standard 2-hour duration for availability preview
          const slotEnd = `${date}T${(hour + 2).toString().padStart(2, '0')}:00Z`;

          const conflictQuery = `
            SELECT COUNT(*) as count FROM reservations 
            WHERE table_id IN (${tableIds})
            AND (start_time < ? AND end_time > ?)
          `;

          const result: any = await new Promise((resolve) => {
            db.get(conflictQuery, [slotEnd, slotStart], (err, row) => resolve(row));
          });

          // If the number of busy tables is less than total suitable tables, the slot is free
          if (result.count < tables.length) {
            availableSlots.push(timeString);
          }
        }
        return availableSlots;
      };

      checkSlots().then(available_slots => {
        res.json({ restaurant_id, date, party_size, available_slots });
      });
    });
  });
});

export default router;