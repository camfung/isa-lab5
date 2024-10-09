class Request {
    constructor(method, url, route, headers, queryParams, urlParams, body) {
        this.method = method;
        this.url = url;
        this.route = route;
        this.headers = headers;
        this.queryParams = queryParams;
        this.urlParams = urlParams;
        this.body = body;
    }
}

module.exports = Request;