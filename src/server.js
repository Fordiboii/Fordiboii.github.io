const http = require("http");
const SERVER_ADDRESS = "localhost";
const SERVER_PORT = 3000;

// Create an instance of the http server to handle HTTP requests
const app = http.createServer((req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Accept': 'text/plain',
        'Content-Type': 'text/plain'
    }
    if (req.method === "POST") {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log(JSON.parse(data));
            res.end();
        })
        res.writeHead(200, headers);
        return;
    }
}).listen(SERVER_PORT, SERVER_ADDRESS);

console.log(`Node server running on port ${SERVER_PORT}`);