global.crypto = require('crypto');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Opera = require('./modelo/opera');

async function main(uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/operas_db') {
  const dataPath = path.join(__dirname, 'operas.json');
  const operas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    await Opera.deleteMany({});
    await Opera.insertMany(operas);

    const count = await Opera.countDocuments();
    console.log(`Importação concluída. Documentos na coleção operas: ${count}`);

    const sample = await Opera.findOne({});
    console.log('Exemplo:', sample ? { id: sample.id, title: sample.title } : null);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = main;