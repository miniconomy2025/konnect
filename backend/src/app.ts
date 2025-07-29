import express from "express";
import { integrateFederation } from "@fedify/express";
import { getLogger } from "@logtape/logtape";
import federation from "./federation.js";
import { connectToDatabase } from './database/connection.js';

import authRoutes from './routes/auth.js';
import webfingerRoutes from './routes/webfinger.js';
import userRoutes from './routes/users.js';

const logger = getLogger("backend");

export const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

await connectToDatabase();

app.use(integrateFederation(federation, (req) => undefined));

app.use('/auth', authRoutes);
app.use('', webfingerRoutes);
app.use('', userRoutes);


app.get("/", (req, res) => {
  res.json({ 
    message: "Instagram Clone API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/google",
      webfinger: "/.well-known/webfinger?resource=acct:username@" + (process.env.DOMAIN || 'localhost:8000'),
      users: "/users/:username"
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;