<template>
  <div class="parking-details">
    <div class="header">
      <h2>{{ parking.name }}</h2>
      <span :class="['availability', availabilityClass]">
        {{ parking.available }} / {{ parking.total }} plazas
      </span>
    </div>

    <div class="details-grid">
      <div class="detail-item">
        <Icon name="material-symbols:attach-money" size="24" />
        <span>{{ parking.price }}</span>
      </div>
      <div class="detail-item">
        <Icon name="material-symbols:location-on" size="24" />
        <span>{{ parking.address }}</span>
      </div>
      <div class="detail-item">
        <Icon name="material-symbols:schedule" size="24" />
        <span>{{ parking.openingHours }}</span>
      </div>
    </div>

    <div v-if="parking.services.length" class="services">
      <h3>Servicios:</h3>
      <div class="service-tags">
        <span
          v-for="service in parking.services"
          :key="service"
          class="service-tag"
        >
          {{ service }}
        </span>
      </div>
    </div>

    <button class="navigate-btn">
      <Icon name="material-symbols:directions" size="20" />
      Cómo llegar
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  parking: {
    type: Object,
    required: true,
  },
});

const availabilityClass = computed(() => {
  const percentage = (props.parking.available / props.parking.total) * 100;
  if (percentage > 50) return "high";
  if (percentage > 20) return "medium";
  return "low";
});
</script>

<style scoped>
.parking-details {
  padding: 1rem;
  background: white;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.availability {
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 0.9rem;
}

.availability.high {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.availability.medium {
  background-color: #fff3e0;
  color: #ef6c00;
}

.availability.low {
  background-color: #ffebee;
  color: #c62828;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.services {
  margin-bottom: 1rem;
}

.services h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-tag {
  background: #f5f5f5;
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.navigate-btn {
  width: 100%;
  padding: 0.8rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.navigate-btn:hover {
  background: #1565c0;
}
</style>
