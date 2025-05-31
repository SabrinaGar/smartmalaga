import { BlobServiceClient } from "@azure/storage-blob";

const BLOB_CONTAINER_NAME = "autopredal";
const parking_ids = [
  "AL",
  "AN",
  "CA",
  "CE",
  "CY",
  "MA",
  "PA",
  "TE",
  "PB",
  "SJ",
];
const config = useRuntimeConfig();
const AZURE_STORAGE_CONNECTION_STRING =
  config.AZURE_STORAGE_PREDICTION_CONNECTION_STRING;

export default defineEventHandler(async () => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING!
  );
  const containerClient =
    blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

  const results: Record<string, any> = {};

  for (const id of parking_ids) {
    const blobName = `pred_${id}.json`;
    const blobClient = containerClient.getBlobClient(blobName);

    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`Blob not found: ${blobName}`);
      results[id] = null;
      continue;
    }

    const downloadBlockBlobResponse = await blobClient.download();
    const readableStream = downloadBlockBlobResponse.readableStreamBody;

    if (!readableStream) {
      console.error(`No readable stream for blob: ${blobName}`);
      results[id] = null;
      continue;
    }

    const downloaded = await streamToString(readableStream);
    results[id] = JSON.parse(downloaded);
  }

  return results;
});

// Helper to convert stream to string
async function streamToString(readableStream: any) {
  return await new Promise<string>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readableStream.on("data", (data: Uint8Array) => chunks.push(data));
    console.log("Reading stream data...");
    console.log("Chunks length:", chunks.length);
    console.log("First chunk length:", chunks[0]?.length || 0);
    readableStream.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    readableStream.on("error", reject);
  });
}
