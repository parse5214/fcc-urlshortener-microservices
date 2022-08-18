require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const url = require('url');
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true,
useUnifiedTopology: true});

const schema = new mongoose.Schema({url: 'string'});
const Url = mongoose.model('Url', schema);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const bodyUrl = req.body.url;
  dns.lookup(url.parse(bodyUrl).hostname, function(err, address) {
    if(!address) res.json({error: 'invalid url'});
    else{
      const originalUrl = new Url({url: bodyUrl});
      originalUrl.save(function(err, data) {
        res.json({
          original_url: data.url,
          short_url: data.id
        });
      });
    }
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  Url.findById(req.params.short_url, function(err, data) {
    if(!data) res.json({error: 'invalid_url'});
    else res.redirect(data.url);
  });
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
