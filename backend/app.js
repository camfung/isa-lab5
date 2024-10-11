const fs = require('fs').promises;
const path = require('path');
const HttpServer = require('./modules/http-server');
const LocalizationHelper = require("./helpers/localization.helper");
require('dotenv').config();
const DAO = require('./modules/dao');
const QueryValidator = require('./modules/query-validator');


class App {
    static patientDataFilePath = path.join(__dirname, './data/patient-data.json');

    static start() {
        const app = new HttpServer();
        const dao = new DAO();

        app.use(this.incrementRequestCount.bind(this));
        app.cors(["https://api.coverai.site"]);

        app.post('/api/insertrecords', async (req, res) => {
            const data = await this.loadJsonData(this.patientDataFilePath);

            try {
                const result = await dao.insert('patient', data);
                const message = LocalizationHelper.getTranslation('Messages.successfullyInserted', [result.affectedRows]);
                res.status(201).send(message);
            } catch (e) {
                res.status(500).send(e.message);
            }
        });

        app.get('/api/query', async (req, res) => {
            const query = req.queryParams.query;

            try {
                const records = await dao.query(query);
                res.status(200).json(records);
            } catch (e) {
                res.status(500).send(e.message);
            }
        });

        app.post('/api/query', async (req, res) => {
            const jsonBody = JSON.parse(req.body);
            const query = jsonBody.query;

            try {
                const result = await dao.query(query);
                const message = LocalizationHelper.getTranslation('Messages.successfullyInserted', [result.affectedRows]);
                res.status(201).send(message);
            } catch (e) {
                res.status(500).send(e.message);
            }
        });

        const port = process.env.PORT;
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
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
