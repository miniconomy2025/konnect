import dotenv from 'dotenv';
import { Neo4jService } from '../services/neo4jService.ts';
import { getLogger } from '@logtape/logtape';

const logger = getLogger('neo4j-verify');

async function verifyNeo4j() {
  dotenv.config();
  
  console.log('Starting Neo4j verification...');
  
  const neo4jService = new Neo4jService();
  const session = neo4jService.getSession();
  
  try {
    // Check constraints
    console.log('Checking constraints...');
    const constraintsResult = await session.run('SHOW CONSTRAINTS');
    const constraints = constraintsResult.records.map(record => record.get('name'));
    console.log('Found constraints:', constraints);

    // Check indexes
    console.log('Checking indexes...');
    const indexesResult = await session.run('SHOW INDEXES');
    const indexes = indexesResult.records.map(record => record.get('name'));
    console.log('Found indexes:', indexes);

    // Try to create test data
    console.log('Testing data operations...');
    
    // Create test user
    await neo4jService.createOrUpdateUser('test-actor-id', 'testuser');
    console.log('Created test user');

    // Create test post
    await neo4jService.createPost('test-post-id', 'test-actor-id', Date.now());
    console.log('Created test post');

    // Create test like
    await neo4jService.likePost('test-actor-id', 'test-post-id');
    console.log('Created test like');

    // Clean up test data
    await session.run(`
      MATCH (n)
      WHERE n.actorId = 'test-actor-id' OR n.postId = 'test-post-id'
      DETACH DELETE n
    `);
    console.log('Cleaned up test data');

    console.log('Neo4j verification completed successfully');
  } catch (error) {
    console.error('Failed to verify Neo4j:', error);
    process.exit(1);
  } finally {
    await session.close();
    await neo4jService.close();
  }
}

// Run the verification
verifyNeo4j(); 