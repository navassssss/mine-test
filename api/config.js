import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');

// Initial load
dotenv.config({ path: envPath });

export const config = {
  reload() {
    dotenv.config({ path: envPath, override: true });
  },

  get MINE_TEST_DOMAIN() {
    this.reload();
    return process.env.MINE_TEST_DOMAIN || 'www.kimi.com';
  },
  get BEARER_TOKEN() {
    this.reload();
    return process.env.BEARER_TOKEN || '';
  },
  get MINE_TEST_AUTH_COOKIE() {
    this.reload();
    return process.env.MINE_TEST_AUTH_COOKIE || '';
  },
  get X_MSH_SESSION_ID() {
    this.reload();
    return process.env.X_MSH_SESSION_ID || '';
  },
  get X_MSH_DEVICE_ID() {
    this.reload();
    return process.env.X_MSH_DEVICE_ID || '';
  },
  get X_TRAFFIC_ID() {
    this.reload();
    return process.env.X_TRAFFIC_ID || '';
  },
  get CF_BM() {
    this.reload();
    return process.env.CF_BM || '';
  },
  get X_MSH_SHIELD_DATA() {
    this.reload();
    return process.env.X_MSH_SHIELD_DATA || '';
  },
  get PORT() {
    this.reload();
    return parseInt(process.env.PORT || process.env.LIVE_API_PORT || '3001', 10);
  },
  get LIVE_API_CHAT_ID() {
    this.reload();
    return process.env.LIVE_API_CHAT_ID || '19ee81d4-8ac2-8ab2-8000-097002f394c3';
  },
  get SUPABASE_URL() {
    this.reload();
    return process.env.SUPABASE_URL || '';
  },
  get SUPABASE_ANON_KEY() {
    this.reload();
    return process.env.SUPABASE_ANON_KEY || '';
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    this.reload();
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }
};
