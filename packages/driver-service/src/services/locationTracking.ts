import { createClient, GeoReplyWith } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

export const updateLocation = async (driverId: string, latitude: number, longitude: number) => {
  // Store driver location using Redis GEO commands
  await redisClient.geoAdd('driver_locations', {
    longitude,
    latitude,
    member: driverId
  });
};

export const getNearbyDrivers = async (longitude: number, latitude: number, radiusKm: number) => {
  // Find drivers within radius
  const drivers = await redisClient.geoSearchWith('driver_locations', 
    { longitude, latitude }, 
    { radius: radiusKm, unit: 'km' },
    [GeoReplyWith.DISTANCE],
    { SORT: 'ASC' }
  );
  return drivers;
};
