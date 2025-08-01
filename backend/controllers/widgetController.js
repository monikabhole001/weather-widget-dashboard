const Widget = require('../models/widgetModel');
const { getWeather } = require('../services/weatherService');

/**
 * GET /api/widgets
 * Returns all saved widgets with live (flattened) weather attached per widget.
 * Uses service-level cache, so repeated locations are fast.
 */
async function getWidgets(req, res) {
  try {
    const widgets = await Widget.find().lean();

    const enriched = await Promise.all(
      widgets.map(async (w) => {
        try {
          const flat = await getWeather(w.location);
          return { ...w, weather: flat, updatedAt: new Date().toISOString() };
        } catch {
          // If a single city fails, keep the widget but set weather to null
          return { ...w, weather: null, updatedAt: new Date().toISOString() };
        }
      })
    );

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch widgets' });
  }
}

/**
 * POST /api/widgets
 * Body: { location: string }
 * Validates location (via getWeather) and creates the widget.
 * Responds with the created widget + flattened weather.
 */
async function createWidget(req, res) {
  try {
    const { location } = req.body;
    if (!location || typeof location !== 'string' || location.trim() === '') {
      return res.status(400).json({ error: 'Valid location is required' });
    }

    const city = location.trim();

    // Validate & get flattened weather; throws if city not found
    const flat = await getWeather(city);

    const widget = new Widget({ location: city });
    await widget.save();

    return res
      .status(201)
      .json({ ...widget.toObject(), weather: flat, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Create Widget Error:', err);
    return res.status(400).json({ error: err.message || 'Invalid location' });
  }
}

/**
 * DELETE /api/widgets/:id
 * Deletes a widget by Mongo ObjectId.
 */
async function deleteWidget(req, res) {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const deleted = await Widget.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Delete Widget Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getWidgets, createWidget, deleteWidget };

