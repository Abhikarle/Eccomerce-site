const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve files from the root directory since index.html is there
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});