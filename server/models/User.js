import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    // FR8: per-user dashboard widget preferences
    dashboardConfig: {
      showGraph:      { type: Boolean, default: true },
      showGuidelines: { type: Boolean, default: true },
      showResources:  { type: Boolean, default: true },
      showFeedback:   { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
