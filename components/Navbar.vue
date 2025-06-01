<template>
  <header
    class="bg-white shadow-md px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-2"
  >
    <h1 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
      Smartmalaga Parkings
    </h1>
    <div
      class="text-sm text-gray-600 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 overflow-x-auto"
    >
      <span v-if="temperatura">🌡️ {{ temperatura }}°C</span>
      <span v-if="precipitacion">🌧️ {{ precipitacion }}%</span>
      <p>Paradas de Autobús</p>
      <img
        :src="BusStopIcon"
        alt="Added"
        class="svn-icon w-4 h-4 align-middle"
      />
      <input
        type="checkbox"
        v-model="showBusStops"
        @change="toggleLayer('busStops')"
      />
      <p>Paradas de Taxis</p>
      <img :src="taxisIcon" alt="Added" class="svn-icon w-4 h-4 align-middle" />
      <input
        type="checkbox"
        v-model="showTaxis"
        @change="toggleLayer('taxis')"
      />
      <p>Semáforos</p>
      <img
        :src="trafficLightsIcon"
        alt="Added"
        class="svn-icon w-4 h-4 align-middle"
      />
      <input
        type="checkbox"
        v-model="showTrafficLights"
        @change="toggleLayer('trafficLights')"
      />
    </div>
    <div class="relative mt-2 sm:mt-0">
      <button
        @click="toggleDropdown"
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        <span>{{ selectedParkingName || "Seleccionar Parking" }}</span>
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
            @click="handleParkingSelection(parking)"
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
</template>

<script setup>
import BusStopIcon from "~/public/icons/bus-stop-pointer-svgrepo-com.svg";
import taxisIcon from "~/public/icons/taxi-taxi-stop-svgrepo-com.svg";
import trafficLightsIcon from "~/public/icons/traffic-lights-traffic-light-svgrepo-com.svg";
import { ref } from "vue";

const props = defineProps({
  temperatura: {
    type: Number,
    default: null,
  },
  precipitacion: {
    type: Number,
    default: null,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
  parkingOptions: {
    type: Array,
    required: true,
  },
  selectedParkingName: {
    type: String,
    default: "",
  },
});
const showTaxis = ref(false);
const showTrafficLights = ref(false);
const showBusStops = ref(false);
const emit = defineEmits(["toggle-dropdown", "select-parking", "update-layer"]);

const toggleDropdown = () => {
  console.log("Dropdown toggled");
  emit("toggle-dropdown");
};

const handleParkingSelection = (parking) => {
  emit("select-parking", parking);
};

const toggleLayer = async (layerType) => {
  switch (layerType) {
    case "taxis":
      emit("update-layer", { layer: "taxis", visible: showTaxis.value });
      break;

    case "trafficLights":
      emit("update-layer", {
        layer: "trafficLights",
        visible: showTrafficLights.value,
      });
      break;

    case "busStops":
      emit("update-layer", { layer: "busStops", visible: showBusStops.value });
      break;
  }
};
</script>
