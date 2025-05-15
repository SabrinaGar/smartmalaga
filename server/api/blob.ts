import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from "stream";

const staticParkingData = [
  { codigo: "AL", name: "Alcazaba", lat: 36.729, lon: -4.4376 },
  { codigo: "MA", name: "Plaza de la Marina", lat: 36.71797, lon: -4.42085 },
  { codigo: "CA", name: "Camas", lat: 36.71944, lon: -4.4247 },
  { codigo: "PA", name: "El Palo", lat: 36.72116, lon: -4.36088 },
  { codigo: "AN", name: "Av. Andalucía", lat: 36.71762, lon: -4.42732 },
  { codigo: "TE", name: "Tejón y Rodríguez", lat: 36.72363, lon: -4.42158 },
  { codigo: "CE", name: "Cervantes", lat: 36.71988, lon: -4.4101 },
  { codigo: "CY", name: "Carlos de Haya", lat: 36.72173, lon: -4.44912 },
  { codigo: "SJ", name: "San Juan", lat: 36.71803, lon: -4.43376 },
  { codigo: "PB", name: "Pio Baroja", lat: 36.72046, lon: -4.36476 },
];

function parseOccupancyCSV(csv: string) {
  const lines = csv.trim().split("\n");
  const latestByCode: Record<string, { date: string; value: number }> = {};

  let temperatura: number | null = null;
  let precipitacion: number | null = null;

  for (const line of lines) {
    const [code, datetime, availableStr] = line.split(",");
    const available = parseFloat(availableStr);

    if (
      !latestByCode[code] ||
      new Date(datetime) > new Date(latestByCode[code].date)
    ) {
      latestByCode[code] = { date: datetime, value: available };
    }
  }

  // Extraer temperatura y precipitación del último registro (última línea del CSV)
  const lastLine = lines[lines.length - 1];
  const [, , , tempStr, precStr] = lastLine.split(",");
  temperatura = parseFloat(tempStr);
  precipitacion = parseFloat(precStr);

  return { latestByCode, temperatura, precipitacion };
}

function getColor(value: number) {
  if (value > 200) return "#22C55E";
  if (value > 10) return "#F97316";
  return "#EF4444";
}

function mergeParkingData(occupancyData: any) {
  return staticParkingData.map((parking) => {
    const occ = occupancyData.latestByCode[parking.codigo];
    return {
      ...parking,
      available: occ ? Math.round(occ.value) : 0,
      date: occ ? new Date(occ.date).toLocaleString() : "No disponible",
      color: getColor(occ ? occ.value : 0),
    };
  });
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const connectionString = config.AZURE_STORAGE_CONNECTION_STRING;
    const query = getQuery(event);
    const blobName = query.name as string;

    if (!blobName) {
      throw new Error("Blob name is missing in the query.");
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient =
      blobServiceClient.getContainerClient("databaseblobtfm1");
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);

    const parsed = parseOccupancyCSV(content);
    const parkingData = mergeParkingData(parsed);

    return {
      temperatura: parsed.temperatura?.toFixed(1),
      precipitacion: parsed.precipitacion?.toFixed(1),
      parkings: parkingData,
    };
  } catch (error) {
    return { error: error.message };
  }
});

async function streamToString(stream: Readable | null) {
  if (!stream) return "";
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = [];
    stream.on("data", (chunk) => chunks.push(chunk.toString()));
    stream.on("end", () => resolve(chunks.join("")));
    stream.on("error", reject);
  });
}
