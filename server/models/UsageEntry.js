import mongoose from 'mongoose';

const usageEntrySchema = new mongoose.Schema(
  {
    // Link every record to the user who created it
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:   { type: Date, required: true, default: Date.now },
    tool:   { type: String, enum: ['ChatGPT', 'GitHub Copilot', 'Claude', 'Gemini', 'Other'], required: true },
    hours:  { type: Number, required: true, min: 0, max: 24 },
    task:   { type: String, required: true, trim: true },
    aiOutput: { type: String, required: true, trim: true },
    subject: { type: String, default: '', trim: true },
    assignmentId: { type: String, default: '', trim: true },
    note:   { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('UsageEntry', usageEntrySchema);
