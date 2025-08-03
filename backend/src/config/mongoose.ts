import { getLogger } from '@logtape/logtape';
import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGOOSE_URL || '';
const logger = getLogger('mongoose');

export const mongoConnect = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(MONGO_URL);

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    process.exit(1);
  }
};
