const fs = require('fs');
const path = require('path');
const operas = require('../datasets/operas.json');
const cantores = require('../datasets/cantores.json');
const compositores = require('../datasets/compositores.json');
const arias = require('../datasets/arias.json');
const teatros = require('../datasets/teatros.json');

const unificar = () => {
  operas.forEach(opera => {
    const compositoresOpera = compositores.find(compositor =>
      Array.isArray(compositor.composedOperas) && compositor.composedOperas.includes(opera.id)
    );
    opera.compositor = compositoresOpera ? {id: compositoresOpera.id, name: compositoresOpera.name } : null;
    const teatroOpera = teatros.find(teatro => teatro.premieredOperas.includes(opera.id));
    opera.teatro = teatroOpera ? {id: teatroOpera.id, name: teatroOpera.name, country: teatroOpera.country } : null;
    const ariasOpera = arias.filter(aria => aria.featuredInOpera === opera.id);
    opera.arias = ariasOpera.map(aria => ({id: aria.id, name: aria.name, voiceType: aria.voiceType }));

    const cantoresOpera = cantores.filter(cantor => cantor.sangIn.includes(opera.id));
    opera.cantores = cantoresOpera.map(cantor => cantor.name);

    
  });

  const outputPath = path.join(__dirname, 'operas.json');
  fs.writeFileSync(outputPath, JSON.stringify(operas, null, 2));
};

unificar();