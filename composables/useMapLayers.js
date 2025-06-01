import { ref } from "vue";

export function useMapLayers(map, L) {
  const taxiMarkers = ref([]);
  const trafficLightMarkers = ref([]);
  const busStopMarkers = ref([]);

  // Define custom icons using your SVGs in /public/icons/
  const taxiIcon = L.icon({
    iconUrl: "/icons/taxi-taxi-stop-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  const trafficLightIcon = L.icon({
    iconUrl: "/icons/traffic-lights-traffic-light-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  const busStopIcon = L.icon({
    iconUrl: "/icons/bus-stop-pointer-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const fetchLayerData = async (url) => {
    try {
      const { data, error } = await useFetch(url);
      if (error.value) throw error.value;
      return data.value || [];
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return [];
    }
  };

  const addMarkersToMap = (data, icon = null) => {
    return data.map((item) => {
      const markerOptions = {};
      if (icon) markerOptions.icon = icon;
      const marker = L.marker([item.lat, item.lon], markerOptions)
        .addTo(map.value)
        .bindPopup(`<b>${item.name || item.NOMBRE || "Sin nombre"}</b>`);
      return marker;
    });
  };

  const removeMarkersFromMap = (markers) => {
    markers.forEach((marker) => marker.remove());
  };

  const handleLayerUpdate = async ({ layer, visible }) => {
    switch (layer) {
      case "taxis":
        if (visible) {
          const TAXIS_URL =
            "https://taxis.azurewebsites.net/api/get_paradas_taxi?";
          const taxiData = await fetchLayerData(TAXIS_URL);
          taxiMarkers.value.push(...addMarkersToMap(taxiData, taxiIcon));
        } else {
          removeMarkersFromMap(taxiMarkers.value);
          taxiMarkers.value.length = 0;
        }
        break;
      case "trafficLights":
        if (visible) {
          const TRAFFICT_LIGHT_URL =
            "https://semaforos.azurewebsites.net/api/get_semaforos?";
          const trafficLightData = await fetchLayerData(TRAFFICT_LIGHT_URL);
          trafficLightMarkers.value.push(
            ...addMarkersToMap(trafficLightData, trafficLightIcon)
          );
        } else {
          removeMarkersFromMap(trafficLightMarkers.value);
          trafficLightMarkers.value.length = 0;
        }
        break;
      case "busStops":
        if (visible) {
          const BUS_URL =
            "https://buses.azurewebsites.net/api/get_lineas_paradas?";
          const busStopData = await fetchLayerData(BUS_URL);
          busStopMarkers.value.push(
            ...addMarkersToMap(busStopData, busStopIcon)
          );
        } else {
          removeMarkersFromMap(busStopMarkers.value);
          busStopMarkers.value.length = 0;
        }
        break;
    }
  };

  return {
    taxiMarkers,
    trafficLightMarkers,
    busStopMarkers,
    handleLayerUpdate,
    fetchLayerData,
    addMarkersToMap,
    removeMarkersFromMap,
  };
}
