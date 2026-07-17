const express = require('express');

const app = express();
const PORT = process.env.PORT || 17061;
const API_URL = process.env.API_URL || 'http://127.0.0.1:17060';

function formatDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function renderPage(title, content) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    a { color: #0b57d0; }
    footer { margin-top: 2rem; font-size: 0.9rem; color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <footer>
    <p>${formatDate()} — Gerado por MyOpera desenvolvido no contexto de EngWeb2026</p>
  </footer>
</body>
</html>`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

app.get('/', async (req, res) => {
  try {
    const operas = await fetchJson(`${API_URL}/operas`);
    const rows = operas.map(opera => `
      <tr>
        <td><a href="/${opera.id}">${opera.id}</a></td>
        <td>${opera.title}</td>
        <td>${opera.premiereYear}</td>
        <td><a href="/compositores/${opera.compositor?.id || ''}">${opera.compositor?.name || ''}</a></td>
        <td><a href="/teatros/${opera.teatro?.id || ''}">${opera.teatro?.country || ''}</a></td>
        <td><a href="/teatros/${opera.teatro?.id || ''}">${opera.teatro?.name || ''}</a></td>
      </tr>`).join('');
    const html = renderPage('Lista de óperas', `
      <p>Lista de registos de óperas.</p>
      <table>
        <thead><tr><th>id</th><th>title</th><th>premiereYear</th><th>compositor.name</th><th>teatro.country</th><th>teatro.name</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`);
    res.send(html);
  } catch (err) {
    res.status(500).send(renderPage('Erro', `<p>${err.message}</p>`));
  }
});



app.get('/teatros/:id', async (req, res) => {
  try {
    const theatres = await fetchJson(`${API_URL}/operas`);
    const theatre = theatres
      .map(op => op.teatro)
      .find(item => item && (item.id === req.params.id || item.name === req.params.id));
    if (!theatre) throw new Error('Teatro não encontrado');
    const operas = theatres.filter(op => op.teatro?.id === theatre.id || op.teatro?.name === theatre.name);
    const rows = operas.map(op => `
      <tr>
        <td><a href="/${op.id}">${op.id}</a></td>
        <td>${op.title}</td>
        <td>${op.premiereYear}</td>
        <td><a href="/compositores/${op.compositor?.id || ''}">${op.compositor?.name || ''}</a></td>
      </tr>`).join('');
    const html = renderPage(`Teatro ${theatre.name}`, `
      <p><strong>Nome:</strong> ${theatre.name}</p>
      <table><thead><tr><th>id</th><th>title</th><th>premiereYear</th><th>compositor.name</th></tr></thead><tbody>${rows}</tbody></table>
      <p><a href="/">Voltar à página principal</a></p>`);
    res.send(html);
  } catch (err) {
    res.status(404).send(renderPage('Não encontrado', `<p>${err.message}</p><p><a href=\"/\">Voltar à página principal</a></p>`));
  }
});

app.get('/compositores/:id', async (req, res) => {
  try {
    const operas = await fetchJson(`${API_URL}/operas`);
    const composer = operas.find(op => op.compositor?.id === req.params.id);
    if (!composer) throw new Error('Compositor não encontrado');
    const rows = operas
      .filter(op => op.compositor?.id === req.params.id)
      .map(op => `
        <tr>
          <td><a href="/${op.id}">${op.id}</a></td>
          <td>${op.title}</td>
          <td>${op.premiereYear}</td>
          <td><a href="/teatros/${op.teatro?.id || ''}">${op.teatro?.country || ''}</a></td>
          <td><a href="/teatros/${op.teatro?.id || ''}">${op.teatro?.name || ''}</a></td>
        </tr>`).join('');
    const html = renderPage(`Compositor ${composer.compositor?.name || req.params.id}`, `
      <p><strong>Nome:</strong> ${composer.compositor?.name || req.params.id}</p>
      <table><thead><tr><th>id</th><th>title</th><th>premiereYear</th><th>teatro.country</th><th>teatro.name</th></tr></thead><tbody>${rows}</tbody></table>
      <p><a href="/">Voltar à página principal</a></p>`);
    res.send(html);
  } catch (err) {
    res.status(404).send(renderPage('Não encontrado', `<p>${err.message}</p><p><a href=\"/\">Voltar à página principal</a></p>`));
  }
});
app.get('/:id', async (req, res) => {
  try {
    const opera = await fetchJson(`${API_URL}/operas/${req.params.id}`);
    const composerHref = `/compositores/${opera.compositor?.id || ''}`;
    const theatreHref = `/teatros/${opera.teatro?.id || ''}`;
    const singers = (opera.cantores || []).map(cantor => `<tr><td>${cantor}</td></tr>`).join('');
    const arias = (opera.arias || []).map(aria => `<tr><td>${aria.id}</td><td>${aria.name}</td><td>${aria.voiceType}</td></tr>`).join('');
    const html = renderPage(`Ópera ${opera.title}`, `
      <p><strong>Identificador:</strong> ${opera.id}</p>
      <p><strong>Ano de estreia:</strong> ${opera.premiereYear}</p>
      <p><strong>Compositor:</strong> <a href="${composerHref}">${opera.compositor?.name || ''}</a></p>
      <p><strong>Teatro:</strong> <a href="${theatreHref}">${opera.teatro?.name || ''}</a></p>
      <h2>Cantores</h2>
      <table><thead><tr><th>Nome</th></tr></thead><tbody>${singers}</tbody></table>
      <h2>Árias</h2>
      <table><thead><tr><th>id</th><th>name</th><th>voiceType</th></tr></thead><tbody>${arias}</tbody></table>
      <p><a href="/">Voltar à página principal</a></p>`);
    res.send(html);
  } catch (err) {
    res.status(404).send(renderPage('Não encontrado', `<p>${err.message}</p><p><a href=\"/\">Voltar à página principal</a></p>`));
  }
});
app.listen(PORT, () => {
  console.log(`Frontend listening on port ${PORT}`);
});
