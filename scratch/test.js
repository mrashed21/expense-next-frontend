const http = require('http');

http.get('http://localhost:8000/api/calendar/events?startDate=2026-08-01T00:00:00.000Z&endDate=2026-08-31T23:59:59.000Z', (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
