import { defineNuxtPlugin } from "nuxt/app";
import { initializeDatabase } from "../database/init";

export default defineNuxtPlugin(async () => {
  // Initialize the database when the app starts
  try {
    await initializeDatabase();
    console.log("Database plugin: Database initialized successfully");
  } catch (error) {
    console.error("Database plugin: Failed to initialize database:", error);
  }
});
