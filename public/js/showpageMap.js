mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';

console.log("Raw camp data:", camp);
console.log("Coordinates field:", camp.geometry.coordinates);
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

// Log and validate camp coordinates
console.log(camp);
console.log("Setting coordinates:", camp.geometry.coordinates);
let coordinates = camp.geometry.coordinates;

if (Array.isArray(coordinates) && coordinates.length === 2) {
  const [lng, lat] = coordinates;
  if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
    console.log("Longitude:", lng, "Latitude:", lat);
    map.setCenter(coordinates);
  } else {
    console.error("Invalid longitude or latitude values:", coordinates);
  }
} else {
  console.error("Invalid coordinates format:", coordinates);
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
