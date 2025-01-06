// Ensure camps.features exists and is an array
const camps = <%- JSON.stringify(camps) %>;  // Pass the data from backend

// Access camps through features array
const campsArray = camps.features || []; // Ensure it's an array

// Initialize the map
const map = L.map('cluster-map').setView([-41, 174], 4.5);  // Set to New Zealand's latitude and longitude

// Set OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Initialize MarkerCluster Group
const markers = L.markerClusterGroup();
console.log("Camps data:", camps);

// Loop through camps and create markers with popup info
if (Array.isArray(campsArray) && campsArray.length > 0) {
  campsArray.forEach(camp => {
    const marker = L.marker([camp.geometry.coordinates[1], camp.geometry.coordinates[0]])  // [lat, lng]
      .bindPopup(`
        <strong><a href="/camps/${camp._id}">${camp.title}</a></strong><br>
        <p>${camp.description}</p><br>
        Price: $${camp.price}
      `);
    markers.addLayer(marker);
  });
} else {
  console.error("Camps data is not in the expected format or is empty");
}

// Add markers to the map with clustering
map.addLayer(markers);
