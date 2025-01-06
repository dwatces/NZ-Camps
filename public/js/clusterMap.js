mapboxgl.accessToken = 'pk.eyJ1IjoiZHdhdGNlcyIsImEiOiJjbTVrOGV2YXIwaWx0Mm5wdGluaTN5MHBhIn0.PbSNIOVUgEtqC40Hv4DaTA';
const map = new mapboxgl.Map({
  container: "cluster-map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: [174, -41], // Coordinates for New Zealand
  zoom: 4.5,
});

map.addControl(new mapboxgl.NavigationControl());

// Add Camps Source with Clustering
map.on("load", function () {
  map.addSource("camps", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: camps.map(camp => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: camp.geometry.coordinates,
        },
        properties: {
          title: camp.title,
          location: camp.location,
          popUpMarkup: `<strong><a href="/camps/${camp._id}">${camp.title}</a></strong><br><p>${camp.description}</p>`,
          price: camp.price,
        },
      })),
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  // Handle cluster clicks
  map.on("click", "clusters", function (e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("camps").getClusterExpansionZoom(clusterId, function (err, zoom) {
      if (err) return;
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
      });
    });
  });

  // Add Marker Layer
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "camps",
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
    filter: ["!", ["has", "point_count"]],
  });

  // Add Cluster Layer
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "camps",
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        100,
        "#f1f075",
        750,
        "#f28cb1",
      ],
      "circle-radius": ["step", ["get", "point_count"], 15, 100, 20, 750, 25],
    },
  });

  // Add Cluster Count
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "camps",
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });
});