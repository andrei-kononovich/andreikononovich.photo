const mongoose = require('mongoose');

const AlbumSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  files: {
    type: [],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  cover:{
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
});


const Album = module.exports = mongoose.model('Album', AlbumSchema);
