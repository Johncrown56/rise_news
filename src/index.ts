import "reflect-metadata";
import dotenv from 'dotenv';
import express from "express";
import { errorHandler } from "./middleware/error";
import cors from "cors";
import AppDataSource from "./config/db";
import routes from "./routes";
import limiter from "./config/limiter";
import { createConnection } from "typeorm";

dotenv.config();

const app = express();
// connect to the DB

createConnection()
   .then(() => {
    console.log(`Database connected successfully`);
   })
   .catch((error) => { 
    console.log(`Error connecting to database`, error)}
);
const startServer = async () => {
    try {
      await AppDataSource.initialize();
      console.log('Database connection established.');

    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  };
  
  startServer();

app.use(express.json());
app.set('trust proxy', true);
// Enable CORS
app.use(cors());
// Enable request limiter
//app.use(limiter);
// Define routes
app.use("/api/v1", routes);

// Catch-all error handler
app.use(errorHandler);

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;