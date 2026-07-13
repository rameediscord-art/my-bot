import { initDb } from "./src/db.js";
import { logger } from "./src/lib/logger.js";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

// Init DB table then start server
initDb()
  .then(async () => {
    const { default: app } = await import("./src/app.js");
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server listening");
    });
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
