<template>
  <div>
    <h1>Estadísticas</h1>
    <p>Bienvenido a la página de estadísticas.</p>
    <p>{{ parking.name }}</p>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Estadísticas",
  description: "Página de estadísticas de Smart Málaga",
});
</script>

<style scoped>
h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #34495e;
}
</style>
