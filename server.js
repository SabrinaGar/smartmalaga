import { createApp } from "./.output/server/index.mjs";
import { listen } from "listhen";

const { app } = await createApp();
await listen(app, {
  port: process.env.PORT || 3000,
  hostname: "0.0.0.0",
});
