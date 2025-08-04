/**
 * Presentational card for a single weather widget.
 * Expects a flattened `weather` object from the backend.
 */

export default function WidgetCard({ widget, onDelete }) {
  const { _id, location, weather } = widget;
  const current = weather; // flattened weather object

  const fmt = (iso, tz) =>
    iso ? new Date(iso).toLocaleString('de-DE', tz ? { timeZone: tz } : undefined) : '-';

  const nowLocal = current?.timezone
    ? new Date().toLocaleString('de-DE', { timeZone: current.timezone })
    : new Date().toLocaleString('de-DE');

  return (
    <div style={{ border: '1px solid #ccc', margin: 10, padding: 16, borderRadius: 6 }}>
      <h3 style={{ marginTop: 0 }}>{location}</h3>

      {current ? (
        <div>
          🌡 <b>Temp:</b> {current.temperature}°C<br />
          💨 <b>Wind:</b> {current.windspeed} km/h ({current.winddirection}°)<br />
          💧 <b>Humidity:</b> {current.humidity ?? '-'}%<br />
          ☁️ <b>Clouds:</b> {current.cloudcover ?? '-'}%<br />
          🌧 <b>Precipitation:</b> {current.precipitation ?? 0} mm<br />
          🌂 <b>Rain chance:</b> {current.precipitation_probability ?? '-'}%<br />
          🌅 <b>Sunrise:</b> {fmt(current.sunrise, current.timezone)}<br />
          🌇 <b>Sunset:</b> {fmt(current.sunset, current.timezone)}<br />
          {/* 🕒 <b>Observed at:</b> {fmt(current.time, current.timezone)}<br /> */}
          🕘 <b>Current local time:</b> {nowLocal}
        </div>
      ) : (
        <div style={{ color: 'gray' }}>⚠️ Loading weather data… or error retrieving</div>
      )}

      <button onClick={() => onDelete(_id)} style={{ marginTop: 12 }}>
        ❌ Delete
      </button>
    </div>
  );
}
