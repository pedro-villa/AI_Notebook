import mongoose from 'mongoose';

const guidelineSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    // Category lets us group guidelines (e.g. privacy, integrity, transparency)
    category:    { type: String, default: 'General' },
    // Ordering field so admins can control display sequence
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Guideline', guidelineSchema);
