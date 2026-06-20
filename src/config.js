import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');

export const config = {
  MINE_TEST_DOMAIN: process.env.MINE_TEST_DOMAIN || 'www.mine-test.com',
  BEARER_TOKEN: process.env.BEARER_TOKEN || '',
  MINE_TEST_AUTH_COOKIE: process.env.MINE_TEST_AUTH_COOKIE || '',
  X_MSH_SESSION_ID: process.env.X_MSH_SESSION_ID || '1731642852852109865',
  X_MSH_DEVICE_ID: process.env.X_MSH_DEVICE_ID || '7649782498766892810',
  X_TRAFFIC_ID: process.env.X_TRAFFIC_ID || 'd7makaun3mk3r6v4rgq0',
  CF_BM: process.env.CF_BM || '',
  X_MSH_SHIELD_DATA: process.env.X_MSH_SHIELD_DATA || '',
  PORT: process.env.PORT || '3000',

  update(updates) {
    Object.assign(this, updates);

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split(/\r?\n/);
    const updatedKeys = new Set();

    const newLines = lines.map(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        if (key in updates) {
          updatedKeys.add(key);
          return `${key}=${updates[key]}`;
        }
      }
      return line;
    });

    Object.keys(updates).forEach(key => {
      if (!updatedKeys.has(key)) {
        newLines.push(`${key}=${updates[key]}`);
      }
    });

    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
  }
};
