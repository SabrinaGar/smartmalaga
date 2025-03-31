<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="show" class="bottom-sheet" @click.self="close">
        <div class="sheet-content">
          <div class="handle"></div>
          <h4>{{ parking?.name || "Cargando..." }}</h4>
          <p>
            <strong>Disponibles:</strong> {{ parking?.available }} /
            {{ parking?.total }}
          </p>
          <p>{{ parking?.description }}</p>
          <button class="btn btn-primary w-100" @click="goToStats">
            Ver Estadísticas
          </button>
          <button class="btn btn-secondary w-100 mt-2" @click="close">
            Cerrar
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({
  show: Boolean, // Define si el modal está abierto
  parking: Object, // Recibe los datos del aparcamiento
});

const emit = defineEmits(["close"]);
const router = useRouter();

const close = () => {
  emit("close");
};

const goToStats = () => {
  if (parking) {
    router.push(`/estadisticas/${parking.name}`);
  }
};
</script>

<style scoped>
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: white;
  box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  transition: transform 0.3s ease-in-out;
}

.sheet-content {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.handle {
  width: 50px;
  height: 5px;
  background: gray;
  margin: 0 auto 10px;
  border-radius: 10px;
}

/* Animación de entrada y salida */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
