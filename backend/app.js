const HttpServer = require('./modules/http-server');
const LocalizationHelper = require("./helpers/localization.helper");


class App {
    static start() {
        const app = new HttpServer();

        app.use(this.incrementRequestCount.bind(this));
        app.cors(["http://127.0.0.1:8080"]);

        app.post('/api/sql', (req, res) => {
            res.send("<p>post req recieved</p>")

        });

        app.get('/api/sql', (req, res) => {
            res.send("<p>get req recieved</p>")
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
