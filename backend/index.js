require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const widgetRoutes = require('./routes/widgetRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/widgets', widgetRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));





