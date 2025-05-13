<template>
  <div
    :class="[
      'h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300',
      isOpen ? 'w-64' : 'w-16',
    ]"
  >
    <!-- Botón para abrir/cerrar el Sidebar -->
    <div class="flex items-center justify-center h-16 border-b border-gray-300">
      <button
        @click="toggleSidebar"
        class="text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <UIcon v-if="isOpen" name="i-lucide-chevron-left" class="size-5" />
        <UIcon v-else name="i-lucide-chevron-right" class="size-5" />
      </button>
    </div>

    <!-- Contenido del Sidebar -->
    <div v-if="isOpen" class="p-4">
      <h3 class="text-lg font-semibold mb-4">Capas del Mapa</h3>
      <div>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="showTaxis"
            @change="toggleLayer('taxis')"
          />
          Mostrar Taxis
        </label>
      </div>
      <div>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="showTrafficLights"
            @change="toggleLayer('trafficLights')"
          />
          Mostrar Semáforos
        </label>
      </div>
      <div>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="showBusStops"
            @change="toggleLayer('busStops')"
          />
          Mostrar Paradas de Autobús
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(true); // Sidebar abierto por defecto
const showTaxis = ref(false);
const showTrafficLights = ref(false);
const showBusStops = ref(false);

const emit = defineEmits(["update-layer"]);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
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

<style scoped>
/* Estilos básicos para el Sidebar */
.flex {
  flex-direction: column;
  display: flex;
}

/* Estilo para el botón */
button {
  cursor: pointer;
  font-size: 24px; /* Tamaño del ícono */
}

/* Estilo para el Sidebar */
.fixed {
  z-index: 40;
}

.h-screen {
  height: 100vh;
}
.flex-1 {
  flex: 1;
}

/* Estilo para el Sidebar */
.h-full {
  height: calc(100% - 4rem); /* Ajusta 4rem según la altura del Navbar */
}
.w-64 {
  width: 16rem; /* Ancho del Sidebar cuando está abierto */
}
.w-16 {
  width: 4rem; /* Ancho del Sidebar cuando está cerrado */
}
.transition-all {
  transition: all 0.3s ease-in-out;
}
.size-5 {
  font-size: 24px; /* Tamaño del ícono */
}
</style>
