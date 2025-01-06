mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';
const map = new mapboxgl.Map({
  container: "cluster-map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: [174, -41], // Coordinates for New Zealand
  zoom: 4.5,
});

map.addControl(new mapboxgl.NavigationControl());

map.on("load", function () {
  // Add a new source for GeoJSON data with clustering enabled
  map.addSource("camps", {
    type: "geojson",
    data: {
      "type": "FeatureCollection",
      "features": camps.map(camp => ({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": camp.geometry.coordinates[1,0]
        },
        "properties": {
          "title": camp.title,
          "location": camp.location,
          "popUpMarkup": `<strong><a href="/camps/${camp._id}">${camp.title}</a></strong><br><p>${camp.description}</p>`,
          "price": camp.price,
        }
      }))
    },
    cluster: true,
    clusterMaxZoom: 14, // Max zoom level to cluster points
    clusterRadius: 50, // Radius for clusters
  });

  // Add layers for clusters
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "camps",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#0dcaf0",
        100,
        "#f1f075",
        750,
        "#f28cb1"
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
    }
  });

  // Add layer to display cluster count
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "camps",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12
    }
  });

  // Add layer for unclustered points (individual camps)
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "camps",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#0dcaf0",
      "circle-radius": 7,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff"
    }
  });

  // Handle cluster clicks
  map.on("click", "clusters", function (e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("camps").getClusterExpansionZoom(clusterId, function (err, zoom) {
      if (err) return;
      map.easeTo({
        center: features[0].geometry.coordinates[1,0],
        zoom: zoom
      });
    });
  });

  // Handle clicks on individual camps (unclustered points)
  map.on("click", "unclustered-point", function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const text = e.features[0].properties.popUpMarkup;

    // Adjust coordinates if necessary
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(text).addTo(map);
  });

  // Change cursor to pointer on hover over clusters
  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  });
});
