import "@js-temporal/polyfill";

import { integrateFederation } from "@fedify/express";
import { getLogger } from "@logtape/logtape";
import express from "express";
import path from "path";

import cors from 'cors';
import dotenv from 'dotenv';
import { mongoConnect } from "./config/mongoose.js";
import federation  from "./federation/setup.ts";
import authRoutes from './routes/auth.js';
import followRoutes from './routes/follow.js';
import inboxRoutes from './routes/inbox.js';
import postRoutes from './routes/posts.js';
import searchRoutes from './routes/search.ts';
import userRoutes from './routes/users.js';
import webfingerRoutes from './routes/webfinger.js';
import { attachFederationContext } from "./middlewares/federation.ts";

dotenv.config();

export const app = express();

app.set("trust proxy", true);
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
    
await mongoConnect();

// Fedify middleware should come before body parsing middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/posts') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
  return next();
}

  integrateFederation(federation, (req) => {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    return new URL(req.originalUrl, baseUrl);
  })(req, res, next);
});

// Body parsing middleware should come after Fedify
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', attachFederationContext, authRoutes);
app.use('/posts', attachFederationContext, postRoutes);
app.use('/search', attachFederationContext, searchRoutes);
app.use('/follows', attachFederationContext, followRoutes);
app.use('/inboxes', inboxRoutes);

app.use('', webfingerRoutes);
app.use('', userRoutes);

const frontendPath = path.join(process.cwd(), '../frontend/out');
app.use(express.static(frontendPath));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/.well-known') || req.path.startsWith('/users') || req.path.startsWith('/posts') || req.path.startsWith('/auth') || req.path.startsWith('/search') || req.path.startsWith('/follows') || req.path.startsWith('/inboxes')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app;