import { ref } from "vue";
import proj4 from "proj4";

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

  // Define UTM zone 30N (EPSG:25830 or EPSG:32630)
  const utm30n = "+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs";
  const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

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
    if (!map.value) {
      console.warn("Map is not initialized when trying to add markers.");
      return [];
    }
    return data
      .filter(
        (item) => typeof item.lat === "number" && typeof item.lon === "number"
      )
      .map((item) => {
        const markerOptions = {};
        if (icon) markerOptions.icon = icon;
        const marker = L.marker([item.lat, item.lon], markerOptions)
          .addTo(map.value)
          .bindPopup(
            `<b>${item.nombreParada || item.NOMBRE || "Sin nombre"}</b>
            <p>${
              ("Código:",
              item.codParada || item.ID || "No hay código disponible.")
            }</p>
           <a href="https://www.google.com/maps/dir/?api=1&destination=${
             item.lat
           },${item.lon}" target="_blank" rel="noopener">
             Ir a Google Maps
           </a>`
          );
        return marker;
      });
  };

  const addMarkersUTMToMap = (data, icon = null) => {
    if (!map.value) {
      console.warn("Map is not initialized when trying to add markers.");
      return [];
    }
    return data
      .filter(
        (item) => typeof item.lat === "number" && typeof item.lon === "number"
      )
      .map((item) => {
        // Convert UTM to lat/lon
        const [lon, lat] = proj4(utm30n, wgs84, [item.lon, item.lat]);
        const markerOptions = {};
        if (icon) markerOptions.icon = icon;
        const marker = L.marker([lat, lon], markerOptions)
          .addTo(map.value)
          .bindPopup(
            `<b>${item.nombreParada || item.NOMBRE || "Sin nombre"}</b>
          <p>Código: ${
            item.codParada || item.ID || "No hay código disponible."
          }</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" rel="noopener">
            Ir a Google Maps
          </a>`
          );
        return marker;
      });
  };

  const removeMarkersFromMap = (markers) => {
    markers.forEach((marker) => marker.remove());
  };

  const handleLayerUpdate = async ({ layer, visible }) => {
    if (!map.value) {
      console.warn("Map is not initialized in handleLayerUpdate.");
      return;
    }
    switch (layer) {
      case "taxis":
        if (visible) {
          console.log("Fetching taxi data...");
          const TAXIS_URL =
            "https://taxisesesa.azurewebsites.net/api/get_paradas_taxi?";
          const taxiData = await fetchLayerData(TAXIS_URL);
          taxiMarkers.value.push(...addMarkersUTMToMap(taxiData, taxiIcon));
        } else {
          removeMarkersFromMap(taxiMarkers.value);
          taxiMarkers.value.length = 0;
        }
        break;
      case "trafficLights":
        if (visible) {
          console.log("Fetching traffic light data...");
          const TRAFFICT_LIGHT_URL =
            "https://semaforosesesa.azurewebsites.net/api/get_semaforos?";
          const trafficLightData = await fetchLayerData(TRAFFICT_LIGHT_URL);
          trafficLightMarkers.value.push(
            ...addMarkersUTMToMap(trafficLightData, trafficLightIcon)
          );
        } else {
          removeMarkersFromMap(trafficLightMarkers.value);
          trafficLightMarkers.value.length = 0;
        }
        break;
      case "busStops":
        if (visible) {
          console.log("Fetching bus stop data...");
          const BUS_URL =
            "https://busesesa.azurewebsites.net/api/get_lineas_paradas?";
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
    addMarkersUTMToMap,
    removeMarkersFromMap,
  };
}
