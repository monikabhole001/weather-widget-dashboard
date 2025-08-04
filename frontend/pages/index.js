import { useEffect, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import AddWidgetForm from '../components/AddWidgetForm';
// Explicitly import with .js extension to ensure resolution
import { getWidgets, createWidget, deleteWidget } from '../utils/api.js';

export default function Home() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  // Load all widgets
  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    console.log('Fetching widgets...'); // Debug log
    setLoading(true);
    try {
      const data = await getWidgets();
      if (Array.isArray(data)) {
        setWidgets(data);
      } else {
        console.error('Widgets is not an array:', data);
        setWidgets([]); // fallback to empty list
      }
    } catch (err) {
      console.error('Failed to fetch widgets:', err);
      setWidgets([]); // fallback on fetch failure
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newWidget) => {
    console.log('Adding new widget:', newWidget); // Debug log
    try {
      setWidgets((prevWidgets) => [...prevWidgets, newWidget]); // Update state immediately
    } catch (err) {
      console.error('Failed to update state with new widget:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWidget(id);
      setWidgets(widgets.filter((widget) => widget._id !== id));
    } catch (err) {
      console.error('Error deleting widget:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 20 }}>Laden...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🌤 Wetter-Dashboard</h1>
      <AddWidgetForm onAdd={handleAdd} />
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {widgets.map((w) => (
          <WidgetCard key={w._id} widget={w} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}