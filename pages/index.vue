<template>
  <div>
    <NuxtLink to="/login">
      <UButton color="primary">Login</UButton>
    </NuxtLink>
    <NuxtLink to="/registro">
      <UButton color="primary">Register</UButton>
    </NuxtLink>
    <NuxtLink to="/map">
      <UButton color="primary">Map</UButton>
    </NuxtLink>
  </div>
</template>
<script setup>
const blobName = "merged_parking_weather"; // puede venir de un input o selección

const { data } = await useFetch(`/api/blob`, {
  query: { name: blobName },
});

if (data.value) {
  console.log("Contenido del blob:", data.value.content);
}
</script>
