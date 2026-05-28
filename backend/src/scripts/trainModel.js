import {db} from '../lib/db.js'
import dotenv from "dotenv"

dotenv.config()

const res = await fetch(`${process.env.ML_SERVICE_URL}/train/ravilez`, {
    method: "POST",
    headers: {"Content-Type" : "application/json"}
});

if (!res.ok) {
    const text = await res.text();
    throw new Error(`ML service failed: ${res.status} - ${text}`);
}