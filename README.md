# ENGWEB2026-Especial

Projeto desenvolvido para a Unidade Curricular de Engenharia Web, com foco em integração de dados, persistência em base de dados NoSQL e disponibilização de uma API REST e de uma interface web simples para consultar informações sobre óperas.

## 1. Objetivo do projeto

O repositório reúne:
- um processo de unificação de datasets em formato JSON;
- uma base de dados MongoDB para persistir os dados consolidados;
- uma API REST em Node.js/Express com Mongoose;
- uma aplicação web em Node.js/Express para apresentar os dados em páginas HTML;
- documentação Swagger para a API;
- orquestração Docker Compose para facilitar a execução do conjunto.

## 2. Estrutura do repositório

- datasets/: ficheiros JSON com os dados originais de óperas, compositores, cantores, árias e teatros.
- ex1/: API, scripts de importação e modelo Mongoose.
  - ex1/app.js: servidor da API REST.
  - ex1/modelo/opera.js: schema do documento Opera em MongoDB.
  - ex1/unificador.js: cria o ficheiro ex1/operas.json a partir dos datasets.
  - ex1/importar-mongoose.js: importa os dados para a coleção operas no MongoDB.
  - ex1/consultador.js: gera estatísticas e um ficheiro queries.txt.
- ex2/: aplicação web que consome a API e renderiza páginas HTML.
- docker-compose.yml: define os serviços mongo, api e web.

## 3. Como foi feita a persistência de dados

A persistência foi implementada com MongoDB e Mongoose.

### Passos usados
1. Os datasets originais em datasets/ foram lidos e integrados.
2. O script ex1/unificador.js criou um ficheiro consolidado ex1/operas.json, enriquecendo cada ópera com:
   - compositor
   - teatro
   - árias
   - cantores
3. O modelo em ex1/modelo/opera.js define a estrutura do documento Opera.
4. A API em ex1/app.js liga-se à base de dados MongoDB e, se a coleção operas estiver vazia, faz o seeding automaticamente a partir de ex1/operas.json.
5. A importação manual pode também ser feita com o script ex1/importar-mongoose.js.

### Base de dados e coleção
- Nome da base de dados: operas_db
- Nome da coleção: operas
- O esquema guarda campos como id, title, genre, premiereYear, runtimeMinutes, descriptionEN, compositor, teatro, arias e cantores.

## 4. Setup da base de dados

A forma recomendada de execução é através de Docker Compose.

### Serviços definidos
- mongo: container com MongoDB 7, exposto na porta 27017.
- api: aplicação da API REST, exposta na porta 17060.
- web: aplicação web, exposta na porta 17061.

### Variáveis de ambiente
- API:
  - PORT=17060
  - MONGODB_URI=mongodb://mongo:27017/operas_db
- Web:
  - PORT=17061
  - API_URL=http://api:17060

### Nota sobre execução local sem Docker
Se se pretender executar sem Docker, é necessário ter um servidor MongoDB ativo e ajustar a variável MONGODB_URI para algo como:
- mongodb://127.0.0.1:27017/operas_db

## 5. Instruções de execução

### Opção recomendada: Docker Compose
A partir da raiz do repositório, executar:

```bash
docker compose up -d --build
```

Depois disso, as aplicações estarão disponíveis em:
- API REST: http://localhost:17060
- Swagger: http://localhost:17060/api-docs
- Interface web: http://localhost:17061

Para parar os serviços:

```bash
docker compose down
```
# Resumo
A persistência de dados foi implementada com MongoDB e Mongoose. O processo começou com a integração dos datasets originais em JSON, seguida da criação de um ficheiro consolidado de óperas com os campos enriquecidos de compositor, teatro, árias e cantores. Esse ficheiro foi carregado para uma base de dados MongoDB chamada operas_db, numa coleção operas. A API desenvolvida em Node.js/Express usa Mongoose para ler, criar, atualizar e eliminar registos, enquanto a aplicação web consome essa API e apresenta os dados em páginas HTML. O conjunto pode ser executado facilmente com Docker Compose, recorrendo aos serviços mongo, api e web, expostos nas portas 27017, 17060 e 17061, respetivamente.
Os resultados das querrys estao em ./ex1/querries.txt
