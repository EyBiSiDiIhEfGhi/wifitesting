import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

const QuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { limit = 100, startDate, endDate } = QuerySchema.parse(req.query);

      const { db } = await connectToDatabase();
    
      let query: any = {};
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate).getTime();
        if (endDate) query.timestamp.$lte = new Date(endDate).getTime();
      }

      const gpsData = await db.collection('gps_data')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      res.status(200).json(gpsData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid query parameters', errors: error.errors });
      } else {
        console.error('Error fetching GPS data:', error);
        res.status(500).json({ message: 'Error fetching data' });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}