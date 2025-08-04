const BASE_URL = 'http://localhost:5000/api/widgets';
// Fetch all widgets
export async function getWidgets() {
  const res = await fetch(BASE_URL);
  return res.json();
}
// Create a widget for a city
export async function createWidget(location) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add widget');
  }

  return res.json();
}
// Delete a widget by _id
export async function deleteWidget(id) {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
}