import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

const GpsDataSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  timestamp: z.number().int().positive(),
  batteryLevel: z.number().min(0).max(100).optional(),
});

type GpsData = z.infer<typeof GpsDataSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const data = GpsDataSchema.parse(req.body);
      const { db } = await connectToDatabase();
    
      await db.collection('gps_data').insertOne(data);

      res.status(200).json({ message: 'Data stored successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        console.error('Error storing GPS data:', error);
        res.status(500).json({ message: 'Error storing data' });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}