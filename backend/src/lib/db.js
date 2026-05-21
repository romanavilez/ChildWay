import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT) || 3306
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