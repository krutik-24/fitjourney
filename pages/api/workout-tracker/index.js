import { verifyToken } from '../../../lib/auth';
import WorkoutTracker from '../../../models/WorkoutTracker';
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
      // Get workout entries for a specific month or recent entries
      const { year, month } = req.query;
      let dateFilter = { userId: decoded.userId };

      if (year && month) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        dateFilter.date = { $gte: startDate, $lte: endDate };
      } else {
        // Default to current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateFilter.date = { $gte: startOfMonth, $lte: endOfMonth };
      }

      const workoutEntries = await WorkoutTracker.find(dateFilter)
        .sort({ date: -1 });

      return res.status(200).json({
        data: workoutEntries
      });
    }

    if (method === 'POST') {
      // Log a new workout
      const { date, workoutType, duration, exercises, notes, intensity } = req.body;

      if (!date) {
        return res.status(400).json({ message: 'Workout date is required' });
      }

      // Check if workout already exists for this date
      const existingWorkout = await WorkoutTracker.findOne({
        userId: decoded.userId,
        date: new Date(date)
      });

      if (existingWorkout) {
        return res.status(400).json({ message: 'Workout already logged for this date' });
      }

      const newWorkout = new WorkoutTracker({
        userId: decoded.userId,
        date: new Date(date),
        workoutType: workoutType || 'General Workout',
        duration: duration ? parseInt(duration) : null,
        exercises: exercises || [],
        notes: notes || '',
        intensity: intensity || 'moderate',
        completed: true
      });

      await newWorkout.save();

      return res.status(201).json({
        message: 'Workout logged successfully',
        data: newWorkout
      });
    }

    if (method === 'PUT') {
      // Update an existing workout
      const { workoutId } = req.query;
      const { workoutType, duration, exercises, notes, intensity, completed } = req.body;

      if (!workoutId) {
        return res.status(400).json({ message: 'Workout ID is required' });
      }

      const updatedWorkout = await WorkoutTracker.findOneAndUpdate(
        { _id: workoutId, userId: decoded.userId },
        {
          $set: {
            workoutType,
            duration: duration ? parseInt(duration) : undefined,
            exercises,
            notes,
            intensity,
            completed,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedWorkout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      return res.status(200).json({
        message: 'Workout updated successfully',
        data: updatedWorkout
      });
    }

    if (method === 'DELETE') {
      // Delete a workout entry
      const { workoutId } = req.query;

      if (!workoutId) {
        return res.status(400).json({ message: 'Workout ID is required' });
      }

      const deletedWorkout = await WorkoutTracker.findOneAndDelete({
        _id: workoutId,
        userId: decoded.userId
      });

      if (!deletedWorkout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      return res.status(200).json({
        message: 'Workout deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout tracking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
