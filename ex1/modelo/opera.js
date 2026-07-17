const mongoose = require('mongoose');

const operaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  premiereYear: { type: Number, required: true },
  runtimeMinutes: { type: Number, required: true },
  descriptionEN: { type: String, required: true },
  compositor: { type: Object, default: null },
  teatro: { type: Object, default: null },
  arias: { type: Array, default: [] },
  cantores: { type: Array, default: [] }
});

module.exports = mongoose.model('Opera', operaSchema, 'operas');
