import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const type = "postgres";

const AppDataSource = new DataSource({
  type,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: ["src/entity/*.{js,ts}"],
  //entities: [__dirname + '**/entity/*.ts'],
//   migrations: [__dirname + '/migration/*.ts'],
//   subscribers: [__dirname + '/subscriber/*.ts'],
});

export default AppDataSource;
