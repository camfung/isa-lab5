class Logger {
    static log(req, res) {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const url = req.url;
        const statusCode = res.statusCode;

        console.log(`[${timestamp}] ${method} ${url} - ${statusCode}`);
    }
}

module.exports = Logger;