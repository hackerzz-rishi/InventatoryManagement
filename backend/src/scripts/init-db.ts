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

async function initializeDatabase() {
  try {
    // Log environment variables
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : undefined
    });

    // First create a connection without database selected
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Read SQL file
    const sqlScript = readFileSync(resolve(__dirname, '../../../sql/init.sql'), 'utf8');

    // Split the SQL file into individual statements and execute them
    const statements = sqlScript.split(';').filter(statement => statement.trim());
    
    for (let statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log('Executed SQL statement successfully');
        } catch (err) {
          console.error('Error executing statement:', err);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('Database initialization completed');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();