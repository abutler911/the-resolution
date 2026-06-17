import { createApp } from "./app.js";
import { env } from "./lib/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`🎵 The Resolution API listening on http://localhost:${env.port}`);
});
