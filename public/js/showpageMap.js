mapboxgl.accessToken = sk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOWxyeGMwNXJkMnFwemV2d3B3eGV5In0.XnkmMhRTO1jOJpjTCyfBOQ;
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
