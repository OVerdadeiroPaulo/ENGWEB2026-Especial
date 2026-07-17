global.crypto = require('crypto');

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function contaDocumentos() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/operas_db', {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    const outputfile = path.join(__dirname, 'queries.txt');
    const count = await mongoose.connection.db.collection('operas').countDocuments();
    fs.writeFileSync(outputfile, `Número de operas na coleção operas:\n ${count}\n`, 'utf8');
    fs.appendFileSync(outputfile, `querry usado para contar: db.operas.countDocuments()\n`, 'utf8');

    const countruntimeMinutes = await mongoose.connection.db.collection('operas').countDocuments({ runtimeMinutes: { $gt: 150 } });
    fs.appendFileSync(outputfile, `Número de operas com runtime maior que 150:\n ${countruntimeMinutes}\n`, 'utf8');
    fs.appendFileSync(outputfile, `querry usado para contar:\n db.operas.countDocuments({ runtimeMinutes: { $gt: 150 } })\n`, 'utf8');

    const paises = (await mongoose.connection.db.collection('operas').distinct('teatro.country')).sort();
    fs.appendFileSync(outputfile, `Lista de países onde ocorreram estreias :\n ${paises.join(', ')}\n`, 'utf8');
    fs.appendFileSync(outputfile, `querry usado para contar:\n db.operas.distinct('teatro.country')\n`, 'utf8');

    const distribuicaoCompositores = await mongoose.connection.db.collection('operas').aggregate([
      { $group: { _id: '$compositor.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    fs.appendFileSync(outputfile, `Distribuição de óperas por compositor:\n`, 'utf8');
    distribuicaoCompositores.forEach(item => {
      fs.appendFileSync(outputfile, `${item._id}: ${item.count}\n`, 'utf8');
    });
    fs.appendFileSync(outputfile, `querry usado para contar:\n db.operas.aggregate([{ $group: { _id: '$compositor.name', count: { $sum: 1 } } }, { $sort: { count: -1 } }])\n`, 'utf8');
 
    const operasItalia = await mongoose.connection.db.collection('operas').find({ 'teatro.country': 'Italy' }, { projection: { title: 1, premiereYear: 1, _id: 0 } }).toArray();
    fs.appendFileSync(outputfile, `Óperas que estrearam em Itália:\n`, 'utf8');
    operasItalia.forEach(opera => {
      fs.appendFileSync(outputfile, `${opera.title} (${opera.premiereYear})\n`, 'utf8');
    });
    fs.appendFileSync(outputfile, `querry usado para contar:\n db.operas.find({ 'teatro.country': 'Italy' }, { projection: { title: 1, premiereYear: 1, _id: 0 } })\n`, 'utf8');

} catch (err) {
    console.error('Erro ao contar documentos:', err);
  } finally {
    await mongoose.disconnect();
  }
}

contaDocumentos();