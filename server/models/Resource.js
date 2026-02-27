import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question:       { type: String, required: true },
  expectedAnswer: { type: String, required: true }, // 'Yes' or 'No'
}, { _id: false });

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type:  { type: String, enum: ['video', 'article', 'document'], required: true },
    url:   { type: String, required: true },
    // Each resource can carry its own quiz questions (FR12)
    quizQuestions: [quizQuestionSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Resource', resourceSchema);
