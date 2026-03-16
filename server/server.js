import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to the MongoDB database
connectDB();

// Initialize Express application
const app = express();

// --- Middleware Setup ---
// Enable CORS for cross-origin requests
app.use(cors());

// Parse incoming request bodies in JSON format
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// --- Routes Setup ---
// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/test-route', (req, res) => {
  res.send('Latest changes are live!');
});

// Mount the authentication routes
app.use('/api/auth', authRoutes);

// Mount the client management routes
app.use('/api/clients', clientRoutes);

// Mount the invoice routes
app.use('/api/invoices', invoiceRoutes);

// Mount the AI integration routes
app.use('/api/ai', aiRoutes);

// Mount the Analytics & Insights routes
app.use('/api/insights', insightRoutes);

// Mount the Product Management routes
app.use('/api/products', productRoutes);

// To be mounted later:
// app.use('/api/users', userRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/ai', aiRoutes);

// --- Error Handling Middleware ---
// Catch requests to undefined routes (404)
app.use(notFound);

// Custom error handler for throwing structured JSON error messages
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

// Start server and listen on the specified port strictly in non-serverless environments
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export the Express API for Vercel Serverless Functions
export default app;
