<template>
  <div id="map" ref="mapContainer"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import L from "leaflet";

const mapContainer = ref(null);

// Datos de ejemplo (deberías obtener estos datos de tu API o BD)
const parkingData = [
  {
    name: "Parking Alcazaba",
    lat: 36.7213,
    lon: -4.4216,
    available: 50,
    total: 100,
  },
  {
    name: "Parking Muelle Uno",
    lat: 36.719,
    lon: -4.4162,
    available: 20,
    total: 150,
  },
  {
    name: "Parking El Palo",
    lat: 36.7202,
    lon: -4.3915,
    available: 5,
    total: 80,
  },
];

// Función para calcular color según ocupación
const getColor = (available, total) => {
  const percentage = (available / total) * 100;
  if (percentage > 50) return "green"; // Más del 50% libre
  if (percentage > 20) return "orange"; // Entre 20% y 50%
  return "red"; // Menos del 20% libre
};

onMounted(() => {
  if (!mapContainer.value) return;

  const map = L.map(mapContainer.value).setView([36.7213028, -4.4216366], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  parkingData.forEach((parking) => {
    const color = getColor(parking.available, parking.total);

    L.circleMarker([parking.lat, parking.lon], {
      color,
      radius: 10, // Ajusta el tamaño del círculo
      fillOpacity: 0.8,
    })
      .addTo(map)
      .bindPopup(
        `<b>${parking.name}</b><br>Disponibles: ${parking.available}/${parking.total}`
      )
      .on("click", () => showParkingInfo(parking));
  });
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  border-radius: 10px;
}
</style>
