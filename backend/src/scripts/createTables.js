import { db } from "../lib/db.js";

export const createTables = async () => {
    // User table creation
    const user = `
        CREATE TABLE IF NOT EXISTS user (
            username VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(100),
            role VARCHAR(7) NOT NULL CHECK(role IN ('child', 'parent')),
            profile_pic VARCHAR(512)
        );
    `;
    db.query(user, (err) => {
        if (err) throw err;
        console.log("User table created!");
    });

    // Parent_child table creation
    const parent_child = `
        CREATE TABLE IF NOT EXISTS parent_child (
            parent_id VARCHAR(255) NOT NULL,
            child_id VARCHAR(255) NOT NULL,
            PRIMARY KEY (parent_id, child_id),
            FOREIGN KEY (parent_id) REFERENCES user(username),
            FOREIGN KEY (child_id) REFERENCES user(username)
        );
    `;
    db.query(parent_child, (err) => {
        if (err) throw err;
        console.log("parent_child table created!")
    })

    // Alert table creation
    const alert = `
        CREATE TABLE IF NOT EXISTS alert (
            child_id VARCHAR(255) NOT NULL,
            parent_id VARCHAR(255) NOT NULL,
            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            alert_type VARCHAR(50) NOT NULL CHECK(alert_type IN ('geofence', 'sos', 'anomaly', 'offline', 'battery')),
            message TEXT,
            longitude DECIMAL(9,6) NOT NULL,
            latitude DECIMAL(9,6) NOT NULL,
            PRIMARY KEY (child_id, parent_id, time),
            FOREIGN KEY (child_id) REFERENCES user(username),
            FOREIGN KEY (parent_id) REFERENCES user(username)
        );
    `;
    db.query(alert, (err) => {
        if (err) throw err;
        console.log("alert table created!");
    });

    // Safe_zone table creation
    const safe_zone = `
        CREATE TABLE IF NOT EXISTS safe_zone (
            child_id VARCHAR(255) NOT NULL,
            sz_name VARCHAR(50) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            latitude DECIMAL (9,6) NOT NULL,
            radius INT NOT NULL,
            PRIMARY KEY (child_id, sz_name),
            FOREIGN KEY (child_id) REFERENCES user(username)
        );
    `;
    db.query(safe_zone, (err) => {
        if (err) throw err;
        console.log("safe_zone table created!");
    })

    // Commute table creation
    const commute = `
        CREATE TABLE IF NOT EXISTS commute (
            child_id VARCHAR(255) NOT NULL,
            start_loc_name VARCHAR(50) NOT NULL,
            end_loc_name VARCHAR(50) NOT NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            route_data JSON,
            PRIMARY KEY (child_id, start_loc_name, end_loc_name),
            FOREIGN KEY (child_id) REFERENCES user(username),
            FOREIGN KEY (child_id, start_loc_name) REFERENCES location(child_id, loc_name),
            FOREIGN KEY (child_id, end_loc_name) REFERENCES location(child_id, loc_name)
        );
    `;
    db.query(commute, (err) => {
        if (err) throw err;
        console.log("commute table created!");
    });

    // Location table creation
    const location = `
        CREATE TABLE IF NOT EXISTS location (
            child_id VARCHAR(255) NOT NULL,
            loc_name VARCHAR(50) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            latitude DECIMAL(9,6) NOT NULL,
            PRIMARY KEY (child_id, loc_name),
            FOREIGN KEY (child_id) REFERENCES user(username)
        );
    `;
    db.query(location, (err) => {
        if (err) throw err;
        console.log("location table created!");
    });

    // Link token table creation
    const linkToken = `
        CREATE TABLE IF NOT EXISTS link_token (
            token_id CHAR(32) UNIQUE NOT NULL PRIMARY KEY,
            child_id VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN NOT NULL,
            FOREIGN KEY (child_id) REFERENCES user(username)
        );
    `
    db.query(linkToken, (err) => {
        if (err) throw err;
        console.log("Link token table created!");
    });

    // Push token table creation
    const pushToken = `
        CREATE TABLE IF NOT EXISTS push_token (
            device_id VARCHAR(36) NOT NULL UNIQUE PRIMARY KEY,
            token VARCHAR(255) NOT NULL UNIQUE,
            user_id VARCHAR(255) NOT NULL,
            platform TEXT CHECK (platform IN ('ios', 'android'))
        );
    `
    db.query(pushToken, (err) => {
        if (err) throw err;
        console.log("Push token table created!");
    })
};