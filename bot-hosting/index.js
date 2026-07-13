import { logger } from "./src/lib/logger.js";
import app from "./src/app.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server listening");
});
