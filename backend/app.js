const fs = require('fs').promises;
const HttpServer = require('./modules/http-server');
const LocalizationHelper = require("./helpers/localization.helper");
require('dotenv').config();
const DAO = require('./modules/dao');
const QueryValidator = require('./modules/query-validator');


class App {
    static patientDataFilePath = './data/patient-data.json';

    static start() {
        const app = new HttpServer();
        const dao = new DAO();

        app.use(this.incrementRequestCount.bind(this));
        app.cors(["http://127.0.0.1:8080"]);

        app.post('/api/insertrecords', async (req, res) => {
            const data = await this.loadJsonData(this.patientDataFilePath);

            try {
                const queryResult = await dao.insert('patient', data);
                const response = `Successfully inserted ${queryResult.affectedRows} records.`
                res.status(201).send(response);
            } catch (e) {
                const response = `Insert failed: ${e}`;
                res.status(500).send(response);
            }
        });

        app.get('/api/query', (req, res) => {
            const query = req.queryParams.query;
            const qv = new QueryValidator(query);
            qv.assertTable('patient').blockInsert().blockUpdate().blockDrop();

            try {
                qv.validate();
            } catch (e) {
                res.status(403).send(e.message);
            }

            res.send("<p>get req recieved</p>")
        });

        app.post('/api/query', (req, res) => {
            res.send("<p>query post req recieved</p>")
        });

        app.listen(app.DEFAULT_PORT, () => {
            console.log(`Server listening on port ${app.DEFAULT_PORT}`);
        });
    }

    static incrementRequestCount() {
        this.requestCount++;
    };

    static async loadJsonData(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data); // Parse the JSON string into an object
        } catch (error) {
            console.error('Error reading JSON file:', error);
            throw error; // Re-throw the error for further handling
        }
    };
}

App.start();
