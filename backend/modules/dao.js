const mysql = require('mysql2');

class DAO {
    constructor() {
        this.connectionStr = process.env.DB_CONNECTION_STRING;
        this.connection = this._connectToServer();
    }

    insert(tableName, data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Input should be a non-empty array of JSON objects.');
        }

        const columns = Object.keys(data[0]);
        const valueSets = this._getInsertValuesFromJson(data);

        const query = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES
            ${valueSets.join(', ')}
        `;

        return this.query(query);
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

    _getInsertValuesFromJson(data) {
        // Map through each object to format the values
        const valuesList = data.map(jsonData => {
            const values = Object.values(jsonData);
            const formattedValues = values.map(value => {
                if (value === null) {
                    return 'NULL'; // Handle null values
                }
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`; // Escape single quotes in strings
                }
                return value; // Leave numbers and other types unchanged
            });
            return `(${formattedValues.join(', ')})`; // Wrap the formatted values for this row
        });

        return valuesList;
    };
}

module.exports = DAO;