import path from 'path'
import cron from 'node-cron'
import {db} from '../lib/db.js'
import {exec} from 'child_process'
import dotenv from "dotenv"

dotenv.config()

// schedule cron to retrain model every sunday at 11:59 PM
cron.schedule("59 23 * * 0", async () => {
    db.query(
        "SELECT child_id FROM user WHERE role = 'child'", 
        async (err, results=[]) => {
            if (err) {
                console.log("Error grabbing child ids");
                return;
            }
            // Train model for each child
            const children = results.map(row => row.child_id);
            for (const child of children) {
                const res = await fetch(`${process.env.ML_SERVICE_URL}/train/${child}`, {
                    method: "POST",
                    headers: {"Content-Type" : "application/json"}
                })
            }
        }
    )
});