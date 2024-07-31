const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var cors = require('cors');
const faceRecognitionRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const loggingMiddleware = require('./middleware/loggingMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

app.use(express.static('public'));

app.use(bodyParser.json());

//Routes
app.use('/api/auth', faceRecognitionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
app.use(loggingMiddleware);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});