const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  professor: { type: String, required: true },
  students: [{ type: String }]
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
