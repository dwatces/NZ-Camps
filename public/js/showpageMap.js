mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: camp.geometry.coordinates,
  zoom: 10,
});

console.log(camp);
console.log("Setting coordinates:", camp.geometry.coordinates);
let coordinates = camp.geometry.coordinates;
if (Array.isArray(coordinates) && coordinates.length === 2) {
  console.log("Longitude:", coordinates[0], "Latitude:", coordinates[1]);
} else {
  console.error("Invalid coordinates format", coordinates);
}

new mapboxgl.Marker()
  .setLngLat(camp.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${camp.title}</h4>`)
  )
  .addTo(map);
