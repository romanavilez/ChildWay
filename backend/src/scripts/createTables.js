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

    // Location table creation
    const location = `
        CREATE TABLE IF NOT EXISTS location (
            location_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            child_id VARCHAR(255) NOT NULL,
            longitude DECIMAL(9,6) NOT NULL,
            latitude DECIMAL(9,6) NOT NULL,
            speed DOUBLE NOT NULL,
            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    });

    // Conversation table creation
    const conversation = `
        CREATE TABLE IF NOT EXISTS conversation (
            conversation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            type ENUM('direct', 'group')
        );
    `
    db.query(conversation, (err) => {
        if (err) throw err;
        console.log("Conversation table created!");
    });

    // Conversation_participants table creation
    const conversation_participant = `
        CREATE TABLE IF NOT EXISTS conversation_participant (
            conversation_id BIGINT NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            PRIMARY KEY (conversation_id, user_id),
            FOREIGN KEY (conversation_id) REFERENCES conversation(conversation_id),
            FOREIGN KEY (user_id) REFERENCES user (username)
        );
    `
    db.query(conversation_participant, (err) => {
        if (err) throw err;
        console.log("conversation_participants table created!");
    });

    const message = `
        CREATE TABLE IF NOT EXISTS message (
            message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            conversation_id BIGINT NOT NULL,
            sender_id VARCHAR(255) NOT NULL,
            message_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversation (conversation_id),
            FOREIGN KEY (sender_id) REFERENCES user (username)
        );  
    `
    db.query(message, (err) => {
        if (err) throw err;
        console.log('Message table created!');
    });
};