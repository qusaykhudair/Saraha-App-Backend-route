import { createClient } from 'redis';

// Create a Redis client
export const redisClient = createClient(
    {
        // put your Redis configuration here if needed, for example:

        // url: process.env.REDIS_URL || 'redis://localhost:3000',
    }
);
// Connect to Redis
export function connectRedis() {
     redisClient.connect().then(() => {
        console.log('Connected to Redis');
    }).catch((err) => {
        // console.error('Error connecting to Redis:', err);
        console.error('Error connecting to Redis check if Redis server is running and configuration is correct');
    });
}