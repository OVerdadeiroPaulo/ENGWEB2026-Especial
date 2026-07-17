global.crypto = require('crypto');

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const Opera = require('./modelo/opera');

const PORT = process.env.PORT || 17060;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/operas_db';

const app = express();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Óperas',
      version: '1.0.0',
      description: 'API CRUD para dados de óperas com Swagger.'
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: [path.join(__dirname, 'app.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check da API
 *     responses:
 *       200:
 *         description: API disponível
 */
app.get('/health', (req, res) => res.json({ status: 'ok' }));

/**
 * @openapi
 * /operas:
 *   get:
 *     summary: Lista todas as óperas
 *     parameters:
 *       - in: query
 *         name: comp
 *         schema:
 *           type: string
 *         description: Identificador do compositor
 *     responses:
 *       200:
 *         description: Lista de óperas
 */
app.get('/operas', async (req, res) => {
  const { comp } = req.query;
  const filter = comp ? { 'compositor.id': comp } : {};
  const operas = await Opera.find(filter, { _id: 0, id: 1, title: 1, premiereYear: 1, 'compositor.name': 1, 'teatro.country': 1 }).sort({ premiereYear: 1, title: 1 });
  res.json(operas.map(opera => ({
    id: opera.id,
    title: opera.title,
    premiereYear: opera.premiereYear,
    compositor: { name: opera.compositor?.name || null },
    teatro: { country: opera.teatro?.country || null }
  })));
});

/**
 * @openapi
 * /operas/{id}:
 *   get:
 *     summary: Obtém uma ópera pelo identificador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ópera encontrada
 *       404:
 *         description: Ópera não encontrada
 */
app.get('/operas/:id', async (req, res) => {
  const opera = await Opera.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
  if (!opera) {
    return res.status(404).json({ error: 'Ópera não encontrada' });
  }
  res.json(opera);
});

/**
 * @openapi
 * /operas:
 *   post:
 *     summary: Cria uma nova ópera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ópera criada
 */
app.post('/operas', async (req, res) => {
  try {
    const opera = await Opera.create({
      id: req.body.id || req.body.title?.toLowerCase().replace(/\s+/g, '-') || `opera-${Date.now()}`,
      ...req.body
    });
    res.status(201).json(opera);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /operas/{id}:
 *   put:
 *     summary: Atualiza uma ópera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ópera atualizada
 *       404:
 *         description: Ópera não encontrada
 */
app.put('/operas/:id', async (req, res) => {
  try {
    const opera = await Opera.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!opera) {
      return res.status(404).json({ error: 'Ópera não encontrada' });
    }
    res.json(opera);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /operas/{id}:
 *   delete:
 *     summary: Remove uma ópera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ópera removida
 *       404:
 *         description: Ópera não encontrada
 */
app.delete('/operas/:id', async (req, res) => {
  const opera = await Opera.findOneAndDelete({ id: req.params.id });
  if (!opera) {
    return res.status(404).json({ error: 'Ópera não encontrada' });
  }
  res.json({ deleted: true, id: req.params.id });
});
/**
 * @openapi
 * /cantores:
 *   get:
 *     summary: Lista todos os cantores e as óperas em que cantaram
 *     responses:
 *       200:
 *         description: Lista de cantores
 */
app.get('/cantores', async (req, res) => {
  const cantores = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/cantores.json'), 'utf8'));
  const operas = JSON.parse(fs.readFileSync(path.join(__dirname, 'operas.json'), 'utf8'));
  const operaById = Object.fromEntries(operas.map(opera => [opera.id, opera]));

  const result = cantores
    .map(cantor => ({
      name: cantor.name,
      operas: (cantor.sangIn || []).map(operaId => ({
        id: operaId,
        title: operaById[operaId]?.title || ''
      }))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(result);
});

/**
 * @openapi
 * /compositores:
 *   get:
 *     summary: Lista todos os compositores e as óperas em que estiveram associados
 *     responses:
 *       200:
 *         description: Lista de compositores
 */
app.get('/compositores', async (req, res) => {
  const compositores = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/compositores.json'), 'utf8'));
  const operas = JSON.parse(fs.readFileSync(path.join(__dirname, 'operas.json'), 'utf8'));
  const operaById = Object.fromEntries(operas.map(opera => [opera.id, opera]));

  const result = compositores
    .map(compositor => ({
      id: compositor.id,
      name: compositor.name,
      operas: (compositor.composedOperas || []).map(operaId => ({
        id: operaId,
        title: operaById[operaId]?.title || ''
      }))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(result);
});

async function connectWithRetry() {
  let retries = 0;
  while (retries < 10) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000, family: 4 });
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      retries += 1;
      console.error(`MongoDB connection failed (${retries}/10):`, err.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Could not connect to MongoDB');
}

async function seedDatabaseIfEmpty() {
  const count = await Opera.countDocuments();
  if (count === 0) {
    const dataPath = path.join(__dirname, 'operas.json');
    const operas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    await Opera.insertMany(operas);
    console.log('Seeded opera data into MongoDB');
  }
}

connectWithRetry()
  .then(() => seedDatabaseIfEmpty())
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or use a different port.`);
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });