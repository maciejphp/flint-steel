import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	multipleStatements: true,
});

const promisePool = pool.promise(); // Enable Promises for async/await

export default promisePool;
