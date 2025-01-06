mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';

console.log("Setting coordinates:", camp.geometry.coordinates);
camp.geometry.coordinates = [172.6812, -34.4329];

fetch('/api/camps/677b2b8e6396d300158a7ac6')
  .then(res => res.json())
  .then(data => console.log("API response:", data))

// Initialize the map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: [172.6812, -34.4329], // Default center (Cape Reinga, NZ)
  zoom: 10,
});

const coordinates = camp.geometry.coordinates;

if (Array.isArray(coordinates) && coordinates.length === 2) {
  const longitude = coordinates[0];
  const latitude = coordinates[1];
  console.log("Longitude:", longitude, "Latitude:", latitude);

  new mapboxgl.Marker()
    .setLngLat([longitude, latitude]) // Force the coordinates
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h4>${camp.title}</h4>
        <p>${camp.description}</p>
      `)
    )
    .addTo(map);
} else {
  console.error("Invalid coordinates:", coordinates);
}

// Add Marker
if (coordinates && Array.isArray(coordinates)) {
  new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${camp.title}</h4>`)
    )
    .addTo(map);
}
