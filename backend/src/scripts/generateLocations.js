import {db} from '../lib/db.js'
import dotenv from "dotenv"

dotenv.config();

const rows = [];
const child_id = 'ravilez';

// Current position
let homeLatitude = Number(process.env.HOME_LATITUDE);
let homeLongitude = Number(process.env.HOME_LONGITUDE);

let latitude, longitude;

// Current time
const start = new Date();
start.setDate(start.getDate() - 7);

// Every 5 seconds for 7 days
const totalPoints = (7 * 24 * 60 * 60) / 5;
for (let i = 0; i < totalPoints; i++) {
    const time = new Date(start.getTime() + i * 5000);

    latitude = homeLatitude + (Math.random() - 0.5) * 0.00005;
    longitude = homeLongitude + (Math.random() - 0.5) * 0.00005;

    const isMoving = Math.random() < 0.2; // 20% movement
    const speed = isMoving
        ? Math.random() * 1.2 // walking inside house
        : 0;                  // idle

    rows.push([
        child_id,
        latitude,
        longitude,
        speed,
        time
    ]);
}

// Insert in chunks to avoid giant queries
const chunkSize = 2000;

for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    try {
        await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO location (child_id, longitude, latitude, speed, time) VALUES ?",
                [chunk], 
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
        console.log(`Inserted rows ${i} - ${i + chunk.length}`);

    } catch (err) {
        console.log("Error inserting location:", err);
        break;
    }
}

process.exit(0);