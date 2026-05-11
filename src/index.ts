import app from "./app.js";
import db from "./db/db.js";
import logger from "./configs/logger.config.js";

const port = process.env.PORT || 3000;

await db.execute("SELECT 1");
logger.info("Drizzle connected successfully");

app.listen(port, () => {
	logger.info(`Server running on port: ${port}`);
});
