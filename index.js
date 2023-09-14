require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const {MongoClient} = require('mongodb');

const client = new MongoClient(process.env.DB_URL)
    
    const db = client.db("test")
    const urls = db.collection("urlshortener")


// Basic Configuration
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const dns = require('dns');
// const url = require('url');


app.post('/api/shorturl', (req, res) => {
  // Incoming fields name - "url"
  const inpurl = req.body.url;
  console.log(inpurl);
  const hostname = new URL(inpurl).hostname;
  dns.lookup(hostname, async(err) => {
    if (err) {
      console.log(err);
      res.json({ error: 'invalid url' });
      return;
    }
    else {
      const urlcount = await urls.countDocuments({})
      const urlDoc ={
        url: inpurl,
        short_url: urlcount
      }
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: inpurl, short_url: urlcount });
    }
  });
})

app.get('/api/shorturl/:number',async (req,res)=>{
  const short_url= req.params.number;
  const urlDoc = await urls.findOne({short_url: +short_url})
  res.redirect(urlDoc.url);
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
