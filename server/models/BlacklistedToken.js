const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistedTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' } // Automatically expire tokens after 24 hours
});

const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

module.exports = BlacklistedToken;
