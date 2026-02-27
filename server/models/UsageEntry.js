import mongoose from 'mongoose';

const usageEntrySchema = new mongoose.Schema(
  {
    // Link every record to the user who created it
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:   { type: Date, required: true },
    tool:   { type: String, enum: ['ChatGPT', 'GitHub Copilot', 'Claude'], required: true },
    hours:  { type: Number, required: true, min: 0, max: 24 },
    // Optional free-text note (e.g. what the student used AI for)
    note:   { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('UsageEntry', usageEntrySchema);
