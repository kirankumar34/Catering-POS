const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'running',
    service: 'Catering POS',
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`Catering POS server running on port ${PORT}`);
});
