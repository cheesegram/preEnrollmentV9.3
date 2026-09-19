import mongoose from 'mongoose';

const scheduleRequestSchema = new mongoose.Schema({
  scheduleId: { type: String, required: true },
  schedule: { type: Object, required: true },
  section: { type: String, trim: true },
  year: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model('ScheduleRequest', scheduleRequestSchema);