const mongoose = require('mongoose');

// const ImageSchema = mongoose.Schema({
//   fieldname: {
//     type: String,
//     required: true
//   },
//   originalname: {
//     type: String,
//     required: true
//   },
//   encoding: {
//     type: String,
//     required: true
//   },
//   mimetype: {
//     type: String,
//     required: true
//   },
//   destination: {
//     type: String,
//     required: true
//   },
//   filename: {
//     type: String,
//     required: true
//   },
//   path: {
//     type: String,
//     required: true
//   },
//   size: {
//     type: Number,
//     required: true
//   },
// });
//
// const Image = module.exports = mongoose.model('Image', ImageSchema);


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
