import "@js-temporal/polyfill";

import { integrateFederation } from "@fedify/express";
import { getLogger } from "@logtape/logtape";
import express from "express";

import cors from 'cors';
import dotenv from 'dotenv';
import { mongoConnect } from "./config/mongoose.js";
import federation from "./federation/federation.ts";
import authRoutes from './routes/auth.js';
import followRoutes from './routes/follow.js';
import inboxRoutes from './routes/inbox.js';
import postRoutes from './routes/posts.js';
import searchRoutes from './routes/search.ts';
import userRoutes from './routes/users.js';
import webfingerRoutes from './routes/webfinger.js';

dotenv.config();
const logger = getLogger("backend");

export const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())


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

app.use((req, res, next) => {
  if (req.path === '/posts' && req.method === 'POST') {
    return next();
  }

  integrateFederation(federation, (req) => {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    return new URL(req.originalUrl, baseUrl);
  })(req, res, next);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/search', searchRoutes);
app.use('/inboxes', inboxRoutes);
app.use('/follows', followRoutes);


app.use('', webfingerRoutes);
app.use('', userRoutes);

app.get("/", (req, res) => res.send("Hello, Fedify!"));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;