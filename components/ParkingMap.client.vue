<template>
  <div>
    <!-- Navbar -->
    <header
      class="bg-white shadow-md px-6 py-4 flex justify-between items-center flex-wrap"
    >
      <h1 class="text-xl font-semibold text-gray-800">Smartmalaga Parkings</h1>
      <div class="text-sm text-gray-600 flex items-center gap-4">
        <span v-if="temperatura">🌡️ {{ temperatura }}°C</span>
        <span v-if="precipitacion">🌧️ {{ precipitacion }} mm</span>
      </div>

      <!-- Dropdown personalizado con Tailwind -->
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
            ></path>
          </svg>
        </button>

        <!-- Panel del dropdown -->
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
          ></span>
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

const staticParkingData = [
  { codigo: "AL", name: "Alcazaba", lat: 36.729, lon: -4.4376 },
  { codigo: "MA", name: "Plaza de la Marina", lat: 36.71797, lon: -4.42085 },
  { codigo: "CA", name: "Camas", lat: 36.71944, lon: -4.4247 },
  { codigo: "PA", name: "El Palo", lat: 36.72116, lon: -4.36088 },
  {
    codigo: "AN",
    name: "Av. Andalucía",
    lat: 36.71762484287124,
    lon: -4.427325331154205,
  },
  {
    codigo: "TE",
    name: "Tejón y Rodríguez",
    lat: 36.72363802291698,
    lon: -4.421589451738778,
  },
  {
    codigo: "CE",
    name: "Cervantes",
    lat: 36.71988077304604,
    lon: -4.410103992612849,
  },
  {
    codigo: "CY",
    name: "Carlos de Haya",
    lat: 36.72173619512131,
    lon: -4.449120476086551,
  },
  {
    codigo: "SJ",
    name: "San Juan",
    lat: 36.71803342522634,
    lon: -4.433768841526088,
  },
  {
    codigo: "PB",
    name: "Pio Baroja",
    lat: 36.720467400258684,
    lon: -4.364769099999999,
  },
];

const getColor = (available) => {
  if (available > 200) return "#22C55E"; // green-500
  if (available > 0) return "#F97316"; // orange-500
  return "#EF4444"; // red-500
};

function parseOccupancyCSV(csv) {
  const lines = csv.trim().split("\n");
  const latestByCode = {};

  for (const line of lines) {
    const [code, datetime, availableStr, tempStr, precStr] = line.split(",");
    const available = parseFloat(availableStr);
    temperatura.value = parseFloat(tempStr).toFixed(1);
    precipitacion.value = parseFloat(precStr).toFixed(1);

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
      date: occ ? new Date(occ.date).toLocaleString() : "No disponible",
      color: getColor(occ ? occ.value : 0),
    };
  });
}

function selectParking(parking) {
  isOpen.value = false;
  focusOnParking(parking);
}

function focusOnParking(parking) {
  if (!parking || !map) return;

  // Animación de zoom al parking seleccionado
  map.flyTo([parking.lat, parking.lon], 17, {
    duration: 1,
    easeLinearity: 0.25,
  });

  // Actualizar parking seleccionado
  selectedParking.value = parking;

  // Resaltar marcador seleccionado
  markers.forEach((marker) => {
    if (marker.options.parkingCode === parking.codigo) {
      marker.openPopup();
      marker.setStyle({
        weight: 3,
        fillOpacity: 1,
      });
    } else {
      marker.setStyle({
        weight: 1,
        fillOpacity: 0.7,
      });
    }
  });
}

async function updateMapData() {
  try {
    const res = await fetch("/api/blob?name=merged_parking_weather");
    const blobData = await res.json();
    const csv = blobData.content;
    const occupancyData = parseOccupancyCSV(csv);
    const parkingData = mergeParkingData(staticParkingData, occupancyData);

    // Actualizar opciones del dropdown
    parkingOptions.value = parkingData;

    // Limpiar marcadores existentes
    markers.forEach((m) => m.remove());
    markers = [];

    // Crear nuevos marcadores
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

    // Si hay un parking seleccionado, actualizar su vista
    if (selectedParking.value) {
      const currentParking = parkingData.find(
        (p) => p.codigo === selectedParking.value.codigo
      );
      if (currentParking) {
        focusOnParking(currentParking);
      }
    }
  } catch (error) {
    console.error("Error actualizando datos del mapa:", error);
  }
}

onMounted(async () => {
  if (!mapContainer.value) return;

  // Importación dinámica de Leaflet
  const L = await import("leaflet");
  await import("leaflet/dist/leaflet.css");

  // Inicializar mapa
  map = L.map(mapContainer.value).setView([36.7213028, -4.4216366], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Cargar datos iniciales
  await updateMapData();

  // Actualizar cada minuto
  intervalId = setInterval(updateMapData, 60000);

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) {
      isOpen.value = false;
    }
  });
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
  if (map) map.remove();
  document.removeEventListener("click", () => {});
});
</script>
