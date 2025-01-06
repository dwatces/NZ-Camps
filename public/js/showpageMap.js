mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: camp.geometry.coordinates,
  zoom: 10,
});

new mapboxgl.Marker()
  .setLngLat(camp.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${camp.title}</h4>`)
  )
  .addTo(map);
