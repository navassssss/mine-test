import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the environment variables from the parent directory's .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  MINE_TEST_DOMAIN: process.env.MINE_TEST_DOMAIN || 'www.kimi.com',
  BEARER_TOKEN: process.env.BEARER_TOKEN || '',
  MINE_TEST_AUTH_COOKIE: process.env.MINE_TEST_AUTH_COOKIE || '',
  X_MSH_SESSION_ID: process.env.X_MSH_SESSION_ID || '',
  X_MSH_DEVICE_ID: process.env.X_MSH_DEVICE_ID || '',
  X_TRAFFIC_ID: process.env.X_TRAFFIC_ID || '',
  CF_BM: process.env.CF_BM || '',
  X_MSH_SHIELD_DATA: process.env.X_MSH_SHIELD_DATA || '',
  PORT: parseInt(process.env.LIVE_API_PORT || '3001', 10),
  LIVE_API_CHAT_ID: process.env.LIVE_API_CHAT_ID || '19ee81d4-8ac2-8ab2-8000-097002f394c3',
};
