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

// Chart.js options for mobile
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: true,
        maxTicksLimit: 4,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

watch(
  [predictions, () => props.parkingCode],
  ([newPredictions, newParkingCode]) => {
    if (
      !newPredictions ||
      !newParkingCode ||
      !newPredictions[newParkingCode] ||
      !Array.isArray(newPredictions[newParkingCode].predicciones)
    ) {
      chartData.value = { labels: [], datasets: [] };
      return;
    }
    // Sort by timestamp ascending
    const parkingPreds = [...newPredictions[newParkingCode].predicciones].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const labels = parkingPreds.map((p: any) => {
      const date = new Date(p.timestamp);
      // Format: DD/MM HH:mm
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    });
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
    <div class="chart-scroll-wrapper">
      <div style="min-width: 400px; height: 250px">
        <Line
          v-if="chartData.labels.length"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.chart-scroll-wrapper {
  width: 100%;
}
@media (max-width: 640px) {
  .chart-scroll-wrapper {
    overflow-x: auto;
  }
}
</style>
