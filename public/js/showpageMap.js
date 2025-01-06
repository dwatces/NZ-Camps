mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: camp.geometry.coordinates,
  zoom: 10,
});

console.log(camp);

new mapboxgl.Marker()
  .setLngLat([-36.8485, 174.7633])
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${camp.title}</h4>`)
  )
  .addTo(map);
