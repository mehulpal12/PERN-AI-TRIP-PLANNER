import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./config/db.js";

const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("✅ Database Connected Successfully");

    app.listen(port, () => {
      console.log(
        `🚀 Server running on http://localhost:${port}`
      );
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

startServer();