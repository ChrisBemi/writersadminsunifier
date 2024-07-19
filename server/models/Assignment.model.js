const mongoose = require("mongoose");

const DateGenerator = require("../utils/DateGenerator");

const assignmentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: false,
  },
  words: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: true,
  },
  dateline: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Non technical",
      "Technical",
      "Dissertation",
      "PowerPoint(Without Speaker Notes)",
      "PowerPoint(With Speaker Notes)",
    ],
  },
  charges: {
    type: Number,
    required: true,
  },
  bid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: DateGenerator(),
  },
  writers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  files: [
    {
      fileName: { type: String, required: true },
      downloadURL: { type: String, required: true },
    },
  ],
  assigned: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedAt: {
    type: String,
    default: DateGenerator(),
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: String,
    default: DateGenerator(),
  },
  inReview: {
    type: Boolean,
    default: false,
  },
  inRevision:{
    type:Boolean,
    default:false
  },
  inRevisionComment: {
    type: String,
  },
  inRevisionFiles: [
    {
      fileName: { type: String, required: true },
      downloadURL: { type: String, required: true },
    },
  ],
  penalty: {
    type: Number,
    default: 0,
  },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
