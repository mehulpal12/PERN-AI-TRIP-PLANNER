import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("✅ Database Connected Successfully");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

startServer();