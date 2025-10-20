import express from 'express';
import path from 'path';
import api1 from './endpoints/api1';
import api2 from './endpoints/api2';

const app = express();
const port = process.env.PORT || 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Backend endpoints
app.use('/api/api1', api1);
app.use('/api/api2', api2);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}`));
