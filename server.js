const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder modules
const education = require('./src/education');
const jobs = require('./src/jobs');
const world = require('./src/world');

// Route modules
app.use('/education', education.router);
app.use('/jobs', jobs.router);
app.use('/world', world.router);

app.listen(port, () => {
  console.log(`NexisGame server listening on port ${port}`);
});