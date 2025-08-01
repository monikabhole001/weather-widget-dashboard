const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Widget', widgetSchema);

