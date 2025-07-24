import { verifyToken } from '../../../lib/auth';
import WeightEntry from '../../../models/WeightEntry';
import connectMongo from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    await connectMongo();

    if (method === 'GET') {
      // Get recent weight entries
      const limit = parseInt(req.query.limit) || 10;
      const weightEntries = await WeightEntry.find({ 
        userId: decoded.userId 
      })
      .sort({ date: -1 })
      .limit(limit);

      return res.status(200).json({
        data: weightEntries
      });
    }

    if (method === 'POST') {
      // Add new weight entry
      const { weight, date, notes } = req.body;

      if (!weight) {
        return res.status(400).json({ message: 'Weight is required' });
      }

      const newEntry = new WeightEntry({
        userId: decoded.userId,
        weight: parseFloat(weight),
        date: date ? new Date(date) : new Date(),
        notes: notes || ''
      });

      await newEntry.save();

      return res.status(201).json({
        message: 'Weight entry added successfully',
        data: newEntry
      });
    }

    if (method === 'DELETE') {
      // Delete weight entry
      const { entryId } = req.query;

      if (!entryId) {
        return res.status(400).json({ message: 'Entry ID is required' });
      }

      const deletedEntry = await WeightEntry.findOneAndDelete({
        _id: entryId,
        userId: decoded.userId
      });

      if (!deletedEntry) {
        return res.status(404).json({ message: 'Entry not found' });
      }

      return res.status(200).json({
        message: 'Weight entry deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Weight tracking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
