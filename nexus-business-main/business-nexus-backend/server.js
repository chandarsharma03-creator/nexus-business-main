// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from "path";
// import { fileURLToPath } from 'url';

// // Route Imports
// import authRoutes from './routes/auth-routes.js';
// import userRoutes from './routes/user-routes.js'; 
// import requestRoutes from './routes/request-routes.js'; 
// import messageRoutes from './routes/messageRoutes.js';
// import dealRoutes from './routes/deal-routes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
// import documentRoutes from './routes/document-routes.js';

// dotenv.config();

// const app = express();

// // --- CORRECTED CORS FOR VERCEL ---
// const allowedOrigins = [
//   'http://localhost:5173', // Local Vite development
//   'https://nexus-business-main.vercel.app',
//   'https://nexus-business-beta.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/deals', dealRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/documents', documentRoutes);

// app.get('/', (req, res) => {
//   res.send('Business Nexus API is running');
// });

// // Static files handling (Compatible with ES Modules)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // For local development
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// }

// // CRITICAL FOR VERCEL: Export the app
// export default app;




import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js'; 
import requestRoutes from './routes/request-routes.js'; 
import messageRoutes from './routes/messageRoutes.js';
import dealRoutes from './routes/deal-routes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import documentRoutes from './routes/document-routes.js';

dotenv.config();

const app = express();


// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  'http://localhost:5173',
  'https://nexus-business-main.vercel.app',
  'https://nexus-business-beta.vercel.app'
];


// ✅ CORS MIDDLEWARE (SAFE VERSION)
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❗ IMPORTANT: don't throw error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// ✅ HANDLE PREFLIGHT (CRITICAL FOR VERCEL)
app.options('*', cors());


// ✅ EXTRA SAFETY HEADERS (VERCEL FIX)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // handle preflight manually
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json());


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);


// ✅ Test Route
app.get('/', (req, res) => {
  res.send('Business Nexus API is running');
});


// ✅ Static files (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ Local Development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}


// ✅ EXPORT FOR VERCEL
export default app;
