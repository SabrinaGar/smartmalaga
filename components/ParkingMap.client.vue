<template>
  <Navbar
    :temperatura="weatherData.temperature"
    :precipitacion="weatherData.precipitation"
    :is-open="isDropdownOpen"
    :parking-options="parkingOptions"
    :selected-parking-name="selectedParking?.name || ''"
    @toggle-dropdown="isDropdownOpen = !isDropdownOpen"
    @select-parking="setSelectedParking"
    @update-layer="handleLayerUpdate"
  />
  <div class="p-4">
    <div id="map" ref="mapContainer" class="w-full h-96 rounded-lg"></div>
    <div v-if="selectedParking" class="mt-4 p-4 bg-white shadow-md rounded-lg">
      <h2 class="text-lg font-semibold">{{ selectedParking.name }}</h2>
      <p class="mt-2">
        <span
          class="inline-block w-3 h-3 rounded-full mr-2"
          :style="`background-color: ${selectedParking.color};`"
        >
        </span>
        Plazas disponibles: <strong>{{ selectedParking.available }}</strong>
      </p>
      <p class="text-sm text-gray-600">
        Última actualización: {{ selectedParking.date }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useMapLayers } from "~/composables/useMapLayers";

const mapContainer = ref(null);
const mapRef = ref(null);
const LRef = ref(null); // <-- Add this line

const selectedParking = ref(null);
const parkingOptions = ref([]);
const isOpen = ref(false);
const temperatura = ref(null);
const precipitacion = ref(null);

let map = null;
let markers = [];
let intervalId = null;

const isDropdownOpen = ref(false);
const weatherData = ref({ temperature: null, precipitation: null });

const setSelectedParking = (parking) => {
  selectedParking.value = parking;
  isDropdownOpen.value = false;

  focusOnParking(parking);
};

function focusOnParking(parking) {
  if (!parking || !map || markers.length === 0) return;

  map.flyTo([parking.lat, parking.lon], 17, {
    duration: 1,
    easeLinearity: 0.25,
  });

  selectedParking.value = parking;

  markers.forEach((marker) => {
    if (marker.options.parkingCode === parking.codigo) {
      marker.openPopup();
      marker.setStyle({ weight: 3, fillOpacity: 1 });
    } else {
      marker.setStyle({ weight: 1, fillOpacity: 0.7 });
    }
  });
}

async function updateMapData() {
  // Guard: Wait until LRef and map are ready
  if (!LRef.value || !map) return;

  try {
    const res = await fetch("/api/blob?name=merged_parking_weather");
    const data = await res.json();

    temperatura.value = data.temperatura;
    precipitacion.value = data.precipitacion;

    const parkingData = data.parkings;
    parkingOptions.value = parkingData;

    markers.forEach((m) => m.remove());
    markers = [];

    parkingData.forEach((parking) => {
      const marker = LRef.value
        .circleMarker([parking.lat, parking.lon], {
          radius: 10,
          fillColor: parking.color,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
          parkingCode: parking.codigo,
        })
        .addTo(map)
        .bindPopup(
          `<b>${parking.name}</b><br>Disponibles: ${parking.available}`
        )
        .on("click", () => {
          selectedParking.value = parking;
        });

      markers.push(marker);
    });

    if (selectedParking.value) {
      const current = parkingData.find(
        (p) => p.codigo === selectedParking.value.codigo
      );
      if (current) focusOnParking(current);
    }
  } catch (error) {
    console.error("Error actualizando datos del mapa:", error);
  }
}

// --- Use the composable ---
let handleLayerUpdate; // <-- Declare here

onMounted(async () => {
  await nextTick();
  if (!mapContainer.value) return;
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  LRef.value = L; // <-- Set LRef
  map = L.map(mapContainer.value).setView([36.7213028, -4.4216366], 13);
  mapRef.value = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Now that mapRef and LRef are set, call the composable
  ({ handleLayerUpdate } = useMapLayers(mapRef, LRef.value));

  await updateMapData();
  intervalId = setInterval(updateMapData, 60000);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) {
      isOpen.value = false;
    }
  });
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
  if (map) map.remove();
});
</script>
<style scoped>
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
</style>
