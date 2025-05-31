<script setup lang="ts">
import { ref, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const props = defineProps({
  parkingCode: {
    type: String,
    default: null,
  },
});

const { data: predictions } = await useFetch("/api/blob-predictions");
const chartData = ref({ labels: [], datasets: [] });

watch(
  [predictions, () => props.parkingCode],
  ([newPredictions, newParkingCode]) => {
    if (!newPredictions || !newParkingCode || !newPredictions[newParkingCode]) {
      chartData.value = { labels: [], datasets: [] };
      return;
    }
    // Sort by timestamp ascending
    const parkingPreds = [...newPredictions[newParkingCode]].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const labels = parkingPreds.map((p: any) => p.timestamp);
    const datasets = [
      {
        label: newParkingCode,
        data: parkingPreds.map((d: any) => d.prediccion),
        borderColor: "#2563eb",
        fill: false,
      },
    ];
    chartData.value = { labels, datasets };
  },
  { immediate: true }
);
</script>

<template>
  <ClientOnly>
    <Line v-if="chartData.labels.length" :data="chartData" />
    <div v-else>Selecciona un parking para ver las predicciones.</div>
  </ClientOnly>
</template>
