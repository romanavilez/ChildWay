import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "cw_database"
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