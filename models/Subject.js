const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
