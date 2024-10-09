const fs = require('fs');
const Logger = require('../modules/logger');
const LocalizationHelper = require('../helpers/localization.helper');

class Response {
    constructor(req, res, cors_headers = {}) {
        this.req = req;
        this.rawRes = res;
        this.headers = {};
        this.statusCode = 200;
        this.cors_headers = cors_headers;
    }

    // Public methods
    setHeaders(headers) {
        this.headers = headers;
    }

    setHeader(key, value) {
        this.headers[key] = value;
    }

    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    send(str) {
        if (!this.headers['Content-Type']) {
            this.setHeader('Content-Type', 'text/html');
        }

        this._writeHeadersAndStatus();
        this.rawRes.end(str, () => {
            Logger.log(this.req, this);
        });
    }

    sendFile(filePath) {
        // Read the HTML file from the filesystem
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // Handle file read error
                this.setHeader('Content-Type', 'text/plain');
                this.status(500).send(LocalizationHelper.getTranslation('ErrorMessages.500'));
            } else {
                this.setHeader('Content-Type', 'text/html');
                this.send(data);
            }
        });
    }

    json(json) {
        const jsonStr = JSON.stringify(json);

        this.setHeader('Content-Type', 'application/json');

        this._writeHeadersAndStatus();
        this.rawRes.end(jsonStr, () => {
            Logger.log(this.req, this);
        });
    }

    // Private methods
    _writeHeadersAndStatus() {
        this.headers = {
            ...this.headers,
            ...this.cors_headers
        }
        this.rawRes.writeHead(this.statusCode, this.headers);
    }
}

module.exports = Response;
