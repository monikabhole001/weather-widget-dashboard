const express = require('express');
const { getWidgets, createWidget, deleteWidget } = require('../controllers/widgetController');

const router = express.Router();

// List all widgets (with live flattened weather attached)
router.get('/', getWidgets);

// Create a widget after validating the location via getWeather()
router.post('/', createWidget);

// Delete a widget by id
router.delete('/:id', deleteWidget);

module.exports = router;
