const http = require('http');
const url = require('url');
const Request = require('../models/request');
const Response = require('../models/response');
const LocalizationHelper = require('../helpers/localization.helper');

class HttpServer {
    DEFAULT_PORT = 3000;

    constructor() {
        this.routes = {
            'GET': {},
            'POST': {}
        };
        this.middlewares = [];
        this.allowedDomains = [];
    }

    // Public Methods
    get(endpoint, callback) {
        this.routes['GET'][endpoint] = {
            endpoint: endpoint,
            method: 'GET',
            callback
        };
    }

    post(endpoint, callback) {
        this.routes['POST'][endpoint] = {
            endpoint: endpoint,
            method: 'POST',
            callback
        };
    }

    use(callback) {
        this.middlewares.push(callback);
    }

    cors(allowedDomains) {
        this.allowedDomains = allowedDomains;
    }

    listen(port = this.DEFAULT_PORT, callback) {
        const server = this._createServer();
        server.listen(port, callback);
    }

    // Private methods
    _createServer() {
        return http.createServer(async (req, res) => {
            // Check the origin of the request (CORS purposed)
            const origin = req.headers.origin;

            const cors_headers = {};
            if (this.allowedDomains.includes(origin)) {
                cors_headers["Access-Control-Allow-Origin"] = origin;
                cors_headers["Access-Control-Allow-Methods"] = 'GET, POST, PUT, DELETE, OPTIONS';
                cors_headers["Access-Control-Allow-Headers"] = 'Content-Type';
            } else {
                // Block request using CORS
                cors_headers["Access-Control-Allow-Origin"] = 'null';
            }

            if (req.method === 'OPTIONS') {
                res.writeHead(204, cors_headers);
                res.end();
                return;
            }

            // Wrap the raw incoming and outgoing messages in custom Request and Response objects
            const request = await this._parseRequest(req);
            const response = new Response(request, res, cors_headers);
            const route = request.route;

            this._execute_middlewares();

            if (route && req.method === route.method) {
                route.callback(request, response);
            } else {
                response.status(404).send(LocalizationHelper.getTranslation('ErrorMessages.EndpointNotFound'));
            }
        });
    }

    async _parseRequest(req) {
        // Get the route
        const parsedUrl = url.parse(req.url, true);
        const httpMethod = req.method;
        const route = this._matchRoute(parsedUrl.pathname, httpMethod);

        // Get the query params
        const queryParams = parsedUrl.query;

        // Get the url params
        let urlParams;
        if (!route) {
            urlParams = null;
        } else {
            urlParams = this._parseUrlParams(route.endpoint, parsedUrl.pathname);
        }

        // Get the body of the request
        const body = await this._parseReqBody(req);

        return new Request(req.method, req.url, route, req.headers, queryParams, urlParams, body);
    }

    _matchRoute(actualUrl, httpMethod) {
        const actualUrlParts = actualUrl.split('/').filter(Boolean);
        const methodSpecificRoutes = this.routes[httpMethod];

        // Try to find a matching route based on the static part (all parts that don't start with ':')
        for (let route in methodSpecificRoutes) {
            const routeParts = route.split('/').filter(Boolean);
            const numStaticRouteParts = routeParts.filter(part => !part.includes(':')).length;

            let isMatch = true;
            for (let i = 0; i < numStaticRouteParts; i++) {
                if (routeParts[i] !== actualUrlParts[i]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return methodSpecificRoutes[route];
            }
        }

        return null;  // No matching route found
    }

    _parseUrlParams(route, actualUrl) {
        // filter(Boolean) removes any falsy/empty values
        const routeParts = route.split('/').filter(Boolean);
        const urlParts = actualUrl.split('/').filter(Boolean);

        if (routeParts.length !== urlParts.length) {
            return null;  // Route does not match
        }

        const params = {};

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                // This part is a parameter, extract it
                const paramName = routeParts[i].slice(1);  // Remove the ":"
                params[paramName] = urlParts[i];
            } else if (routeParts[i] !== urlParts[i]) {
                // This part does not match, return null
                return null;
            }
        }

        return params;
    }

    async _parseReqBody(req) {
        return new Promise((resolve, reject) => {
            let body = [];

            req.on('data', chunk => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                resolve(body);
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    _execute_middlewares() {
        for (let func of this.middlewares) {
            func();
        }
    }
}

module.exports = HttpServer;
