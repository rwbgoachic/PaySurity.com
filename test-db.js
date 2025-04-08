import { storage } from './server/storage.js';

async function testDatabase() {
  try {
    const user = await storage.getUserByUsername('testuser');
    console.log('User:', user);
  } catch (error) {
    console.error('Error retrieving user:', error);
  }
}

testDatabase();
