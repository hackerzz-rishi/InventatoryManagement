import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
const envPath = resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully')
}

async function updateRoles() {
  try {
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : undefined,
      DB_NAME: process.env.DB_NAME
    });

    // Create connection
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Read SQL file
    const sqlScript = readFileSync(resolve(__dirname, '../../../sql/update_roles.sql'), 'utf8');

    // Split the SQL file into individual statements and execute them
    const statements = sqlScript.split(';').filter(statement => statement.trim());
    
    for (let statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log('Executed SQL statement successfully:', statement.trim().split('\n')[0]);
        } catch (err) {
          console.error('Error executing statement:', err);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('Role updates completed');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error updating roles:', error);
    process.exit(1);
  }
}

updateRoles();