import { useState } from 'react';

/**
 * Small controlled form to add a widget by city name.
 * Delegates saving to the parent via `onCreate(location)`.
 */
export default function AddWidgetForm({ onAdd }) {
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setError('Bitte geben Sie einen Ort ein');
      return;
    }

    setError(null); // Clear previous error
    try {
      const response = await fetch('http://localhost:5000/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: trimmedLocation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Hinzufügen des Widgets');
      }

      const newWidget = await response.json();
      onAdd(newWidget); // Pass the new widget to the parent
      setLocation(''); // Clear the input
    } catch (err) {
      setError(
        err.message === `Invalid location: '${trimmedLocation}' not found`
          ? 'Bitte geben Sie einen gültigen Städtenamen ein'
          : err.message === 'Valid location is required'
          ? 'Bitte geben Sie einen Ort ein'
          : err.message
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ort eingeben..."
          required
          style={{ padding: 5, marginRight: 10 }}
        />
        <button type="submit" style={{ padding: 5 }}>➕ Hinzufügen</button>
      </form>
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 5 }}>{error}</div>}
    </div>
  );
}