const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    required: true
  },
  agency: {
    type: String,
    enum: ['NDMA', 'IMD', 'CWC', 'State DMA', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  data: mongoose.Schema.Types.Mixed,
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  dueDate: Date,
  submittedAt: Date,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: String,
  reviewedAt: Date,
  reviewComments: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
