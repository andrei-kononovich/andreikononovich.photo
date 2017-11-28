const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
});


const Feedback = module.exports = mongoose.model('Feedback', FeedbackSchema);
