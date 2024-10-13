import { createClient } from "redis";

const redisClient = createClient({
    url: `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    ...(process.env.NODE_ENV !== 'development' && {
        tls: {},
      }),
    // socket: {
    //     ...(process.env.ENVIRONMENT !== "development" && { tls: true }),
    //     rejectUnauthorized: false,
    // },
});

redisClient.on('error', (err) => {
    //console.error('Redis Client Error:', err);
});

redisClient.connect();

export { redisClient };


