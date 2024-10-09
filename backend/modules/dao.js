const mysql = require('mysql2');

class DAO {
    constructor() {
        this.connectionStr = process.env.DB_CONNECTION_STRING;
        this.connection = this._connectToServer();
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err, results) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(results); // Resolve the promise with the results
                }
            });
        });
    }

    _connectToServer() {
        // Create a connection using a connection string
        const connection = mysql.createConnection(this.connectionStr);

        // Connect to the MySQL server
        connection.connect(async (err) => {
            if (err) {
                console.error('Error connecting to mysql/lab5 database: ' + err.stack);
                return;
            }
            console.log('Database connection successful. Connection ID: ' + connection.threadId);

            try {
                await this._createPatientTableIfNotExist();
            } catch (e) {
                console.error("Error creating table 'patient': " + e.message);
            }
        });

        return connection;
    }

    async _createPatientTableIfNotExist() {
        const createQuery = `
            CREATE TABLE IF NOT EXISTS patient (
                patientId   INT(11) AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(100) NOT NULL,
                dateOfBirth DATETIME NOT NULL
            ) ENGINE=InnoDB;
        `;

        return await this.query(createQuery);
    }
}

module.exports = DAO;