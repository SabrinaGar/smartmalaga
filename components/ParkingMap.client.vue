<template>
  <div>
    <header
      class="bg-white shadow-md px-6 py-4 flex justify-between items-center flex-wrap"
    >
      <h1 class="text-xl font-semibold text-gray-800">Smartmalaga Parkings</h1>
      <div class="text-sm text-gray-600 flex items-center gap-4">
        <span v-if="temperatura">🌡️ {{ temperatura }}°C</span>
        <span v-if="precipitacion">🌧️ {{ precipitacion }} mm</span>
      </div>
      <div class="relative">
        <button
          @click="isOpen = !isOpen"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <span>{{ selectedParking?.name || "Seleccionar Parking" }}</span>
          <svg
            class="w-5 h-5"
            :class="{ 'transform rotate-180': isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          v-if="isOpen"
          class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-[1001] border border-gray-200"
        >
          <div class="py-1 max-h-60 overflow-auto z-50">
            <div
              v-for="parking in parkingOptions"
              :key="parking.codigo"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              @click="selectParking(parking)"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: parking.color }"
              ></div>
              <span>{{ parking.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mapa -->
    <div class="p-4">
      <div id="map" ref="mapContainer" class="w-full h-96 rounded-lg"></div>
      <div
        v-if="selectedParking"
        class="mt-4 p-4 bg-white shadow-md rounded-lg"
      >
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
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const mapContainer = ref(null);
const selectedParking = ref(null);
const parkingOptions = ref([]);
const isOpen = ref(false);
const temperatura = ref(null);
const precipitacion = ref(null);

let map = null;
let markers = [];
let intervalId = null;

function selectParking(parking) {
  isOpen.value = false;
  focusOnParking(parking);
}

function focusOnParking(parking) {
  if (!parking || !map) return;

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
      const marker = L.circleMarker([parking.lat, parking.lon], {
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
onMounted(async () => {
  await nextTick();
  if (!mapContainer.value) return;
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  map = L.map(mapContainer.value).setView([36.7213028, -4.4216366], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

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
