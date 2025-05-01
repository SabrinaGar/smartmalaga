<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
    <ParkingDetails v-if="selectedParking" :parking="selectedParking" />
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from "vue";

const mapContainer = ref(null);
const selectedParking = ref(null);
let map = null;
let markers = [];
let intervalId = null;

const staticParkingData = [
  { codigo: "AL", name: "Alcazaba", lat: 36.729, lon: -4.4376 },
  { codigo: "MA", name: "Plaza de la Marina", lat: 36.71797, lon: -4.42085 },
  { codigo: "CA", name: "Camas", lat: 36.71944, lon: -4.4247 },
  { codigo: "PA", name: "El Palo", lat: 36.72116, lon: -4.36088 },
];

const getColor = (available) => {
  if (available > 200) return "green";
  if (available > 0) return "orange";
  return "red";
};

function parseOccupancyCSV(csv) {
  const lines = csv.trim().split("\n");
  const latestByCode = {};

  for (const line of lines) {
    const [code, datetime, availableStr] = line.split(",");
    const available = parseFloat(availableStr);

    if (
      !latestByCode[code] ||
      new Date(datetime) > new Date(latestByCode[code].date)
    ) {
      latestByCode[code] = { date: datetime, value: available };
    }
  }

  return latestByCode;
}

function mergeParkingData(staticData, occupancyData) {
  return staticData.map((parking) => {
    const occ = occupancyData[parking.codigo];
    return {
      ...parking,
      available: occ ? Math.round(occ.value) : 0,
    };
  });
}

const showParkingInfo = (parking) => {
  selectedParking.value = parking;
};

async function updateMapData() {
  try {
    const res = await fetch("/api/blob?name=merged_parking_weather");
    const blobData = await res.json();
    const csv = blobData.content;
    const occupancyData = parseOccupancyCSV(csv);
    const parkingData = mergeParkingData(staticParkingData, occupancyData);

    // Limpiar marcadores anteriores
    markers.forEach((m) => m.remove());
    markers = [];

    parkingData.forEach((parking) => {
      const color = getColor(parking.available);

      const marker = L.circleMarker([parking.lat, parking.lon], {
        color,
        radius: 10,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(
          `<b>${parking.name}</b><br>Disponibles: ${parking.available}`
        )
        .on("click", () => showParkingInfo(parking));

      markers.push(marker);
    });
  } catch (error) {
    console.error("Error actualizando datos del mapa:", error);
  }
}

onMounted(async () => {
  if (!mapContainer.value) return;

  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  map = L.map(mapContainer.value).setView([36.7213028, -4.4216366], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  await updateMapData();

  intervalId = setInterval(updateMapData, 60000);
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  border-radius: 10px;
}
</style>
