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

const taxiMarkers = [];
const trafficLightMarkers = [];
const busStopMarkers = [];

const handleLayerUpdate = async ({ layer, visible }) => {
  switch (layer) {
    case "taxis":
      if (visible) {
        const TAXIS_URL =
          "https://taxis.azurewebsites.net/api/get_paradas_taxi?";
        const taxiData = await fetchLayerData(TAXIS_URL);
        taxiMarkers.push(...addMarkersToMap(taxiData));
      } else {
        removeMarkersFromMap(taxiMarkers);
        taxiMarkers.length = 0;
      }
      break;

    case "trafficLights":
      if (visible) {
        const TRAFFICT_LIGHT_URL =
          "https://semaforos.azurewebsites.net/api/get_semaforos?";
        const trafficLightData = await fetchLayerData(TRAFFICT_LIGHT_URL);
        trafficLightMarkers.push(...addMarkersToMap(trafficLightData));
      } else {
        removeMarkersFromMap(trafficLightMarkers);
        trafficLightMarkers.length = 0;
      }
      break;

    case "busStops":
      if (visible) {
        const BUS_URL =
          "https://buses.azurewebsites.net/api/get_lineas_paradas?";
        const busStopData = await fetchLayerData(BUS_URL);
        const busStopIcon = L.icon({
          iconUrl: "/icons/bus-stop-pointer-svgrepo-com.svg",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        busStopMarkers.push(...addMarkersToMap(busStopData, busStopIcon));
      } else {
        removeMarkersFromMap(busStopMarkers);
        busStopMarkers.length = 0;
      }
      break;
  }
};

const fetchLayerData = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return [];
  }
};

const addMarkersToMap = (data, icon = null) => {
  return data.map((item) => {
    const markerOptions = {};
    if (icon) markerOptions.icon = icon;
    const marker = L.marker([item.lat, item.lon], markerOptions)
      .addTo(map)
      .bindPopup(`<b>${item.name || item.NOMBRE || "Sin nombre"}</b>`);
    return marker;
  });
};

const removeMarkersFromMap = (markers) => {
  markers.forEach((marker) => marker.remove());
};

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
<style scoped>
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
</style>
