<template>
  <header
    class="bg-white shadow-md px-6 py-4 flex justify-between items-center flex-wrap"
  >
    <h1 class="text-xl font-semibold text-gray-800">Smartmalaga Parkings</h1>
    <div class="text-sm text-gray-600 flex items-center gap-4">
      <span v-if="temperatura">🌡️ {{ temperatura }}°C</span>
      <span v-if="precipitacion">🌧️ {{ precipitacion }}%</span>
    </div>
    <div class="relative">
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

const emit = defineEmits(["toggle-dropdown", "select-parking"]);

const toggleDropdown = () => {
  console.log("Dropdown toggled");
  emit("toggle-dropdown");
};

const handleParkingSelection = (parking) => {
  emit("select-parking", parking);
};
</script>
