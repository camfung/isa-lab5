const HttpServer = require('./modules/http-server');
const LocalizationHelper = require("./helpers/localization.helper");


class App {
    static start() {
        const app = new HttpServer();

        app.use(this.incrementRequestCount.bind(this));
        app.cors(["http://127.0.0.1:8080"]);

        app.post('/api/insertrecords', (req, res) => {
            res.json([{
                parentId: 1,
                name: "Sara Brown",
                dateOfBirth: "1901-01-01",
            },
            {
                parentId: 1,
                name: "John Smith",
                dateOfBirth: "1941-01-01",
            },
            {
                parentId: 1,
                name: "Jack Ma",
                dateOfBirth: "1961-01-30",
            },
            {
                parentId: 1,
                name: "Elon Musk",
                dateOfBirth: "1999-01-01",
            }

            ])
        });

        app.get('/api/query', (req, res) => {
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
    }
}

App.start();
