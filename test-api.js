const https = require('https');

const data = JSON.stringify({
  filters: ["id", "=", "v11"],
  results: 1,
  fields: "id, title, alttitle, image.url, image.sexual, image.violence, description, rating",
});

const options = {
  hostname: 'api.vndb.org',
  port: 443,
  path: '/kana/vn',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log(body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
