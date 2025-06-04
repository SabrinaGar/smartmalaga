<template>
  <ParkingMap />
</template>
<script setup>
const blobName = "merged_parking_weather"; // puede venir de un input o selección

const { data } = await useFetch(`/api/blob`, {
  query: { name: blobName },
});
</script>
