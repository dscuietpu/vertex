const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    category: {
      type: String,
      enum: ['Road & Traffic', 'Water & Drainage', 'Electricity', 'Sanitation', 'Public Property', 'Other'],
      default: 'Other',
    },
    // How many times this issue (or its duplicates) has been reported
    reportCount: {
      type: Number,
      default: 1,
    },
    // If this record is a duplicate, points to the original issue
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Issue', issueSchema);
