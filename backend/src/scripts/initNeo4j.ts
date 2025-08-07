import dotenv from 'dotenv';
import { Neo4jService } from '../services/neo4jService.ts';
import { getLogger } from '@logtape/logtape';

const logger = getLogger('neo4j-init');

async function initializeNeo4j() {
  dotenv.config();
  
  console.log('Starting Neo4j initialization...');
  
  const neo4jService = new Neo4jService();
  
  try {
    // This will test the connection (verifyConnectivity is called in constructor)
    console.log('Testing connection...');
    
    // Initialize schema
    console.log('Initializing schema...');
    await neo4jService.initializeSchema();
    
    console.log('Neo4j initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize Neo4j:', error);
    process.exit(1);
  } finally {
    await neo4jService.close();
  }
}

// Run the initialization
initializeNeo4j(); 