const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  fileUrl:     { type: String },           // path to uploaded file
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role:        { type: String }            // which role can view it
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);