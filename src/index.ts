import "reflect-metadata";
//import { createConnection } from "typeorm";
//require("dotenv").config();
import dotenv from 'dotenv';
import express from "express";
import { errorHandler } from "./middleware/error";
//import dataSource from "./config/db";
import cors from "cors";
import AppDataSource from "./config/db";
import routes from "./routes";

dotenv.config();
// createConnection()
//   .then(() => {
//     const app = express();
//     app.use(express.json());

//     app.use("/users", userRouter);
//     app.use("/posts", postRouter);
//     app.use("/comments", commentRouter);

//     app.use(errorHandler);

//     const port = process.env.PORT || 3000;

//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   })
//   .catch((error) => console.log(error));

// createConnection()
//    .then(() => {
//     console.log(`Database connected successfully`);
//    })
//    .catch((error) => { 
//     console.log(`Error connecting to database`, error)}
// );

const app = express();
// connect to the DB
// dataSource.initialize().then(() => {
//     console.log(`Database connected successfully`)
// })
// .catch((error) => { 
//     console.log(`Error connecting to db`, error)}
// );

const startServer = async () => {
    try {
      await AppDataSource.initialize();
      console.log('Database connection established.');
  
      // Your application logic here
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  };
  
  startServer();

app.use(express.json());
// Trust the first proxy
app.set('trust proxy', true);

// Enable CORS
app.use(cors());

// Define your routes
app.use("/api/v1", routes);


// Catch-all error handler
app.use(errorHandler);

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;