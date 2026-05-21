import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306
});

export const ConnectDB = async () => {
    try {
        const connection = await db.promise().getConnection();
        console.log("Connected to MySQL!");
        connection.release();
    } catch (err) {
        console.error("Failed connecting to database: ", err);
    }
};