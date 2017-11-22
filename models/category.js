const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  }
});

const Category = module.exports = mongoose.model('Category', CategorySchema);
