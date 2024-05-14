const express = require('express');
var crypto = require('crypto');

const port = 3001;
const atlosApiSecret = 'Kw3q8Gk3oB0cSk3LyaXC1Zah4beK1AEd';  // your ATLOS API secret

const app = express();

// Must process raw request data in order for signature to work correctly
app.use(function(req, res, next) {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) { 
    req.rawBody += chunk;
  });

  req.on('end', function() {
    next();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
  
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/postback', async function(req, res, next) {
  try {
    let hmac = crypto.createHmac('sha256', atlosApiSecret);
    let data = hmac.update(req.rawBody);    // use the raw request data

    let signature = req.headers['signature'];    // note "signature" is lowercase
    console.log('signature', signature);

    let expectedSignature = data.digest('base64');
    console.log('expectedSignature', expectedSignature);

    if (signature === expectedSignature) console.log('The postback data is authentic');
    else console.log('The postback data is NOT authentic');

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});
