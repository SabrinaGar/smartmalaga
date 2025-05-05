import { BlobServiceClient } from "@azure/storage-blob";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const connectionString = config.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: "Missing Azure Storage connection string",
    });
  }

  const query = getQuery(event);
  const blobName = query.name as string;

  if (!blobName) {
    throw createError({
      statusCode: 400,
      message: "Missing blob name in query params",
    });
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient =
    blobServiceClient.getContainerClient("databaseblobtfm1");
  const blobClient = containerClient.getBlobClient(blobName);

  if (!(await blobClient.exists())) {
    throw createError({
      statusCode: 404,
      message: `Blob "${blobName}" not found.`,
    });
  }

  const downloadResponse = await blobClient.download();
  const content = await streamToString(downloadResponse.readableStreamBody);

  return {
    name: blobName,
    content,
  };
});

async function streamToString(
  readableStream: NodeJS.ReadableStream | null
): Promise<string> {
  if (!readableStream) return "";
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    readableStream.on("data", (chunk) => chunks.push(chunk.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}
