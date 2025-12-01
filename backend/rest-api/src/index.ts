import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { ticketRouter } from './routes/tickets';
import { ticketTemplateRouter } from './routes/ticket_templates';
import { eventRouter } from './routes/events';
import marketplaceRouter from './routes/marketplace';
import checkinRouter from './routes/checkin';
import transactionsRouter from './routes/transactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.send('NFT Ticketing REST API Server is running!');
});

app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/ticket_templates', ticketTemplateRouter);
app.use('/api/events', eventRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/transactions', transactionsRouter);


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
