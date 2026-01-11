import express from 'express';
import bodyParser from 'body-parser';
import restaurantRoutes from './routes/restaurantRoutes';
import { initDb } from './database/db';
import reservationRoutes from './routes/reservationRoutes';

const app = express();
app.use(bodyParser.json());
app.use('/api', reservationRoutes);

// Initialize Database
initDb();

// Routes
app.use('/api', restaurantRoutes);
app.use('/api', reservationRoutes);

export default app;