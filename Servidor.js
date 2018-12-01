var net = require('net');
var http = require('http');
var url = require('url');

/* ********DECLARACIÓN DE VARIABLES******** */
var NTP_PORT = 6887;
var HTTP_PORT = 4887;

var registroClientes = [];

function resHTML() {
    var clientesConectados = '';
    registroClientes.forEach(cliente => {
        clientesConectados += `<tr>
            <td>` + cliente.username + `</td>
            <td>` + cliente.ip + `</td>
            <td>` + cliente.port + `</td>
            <td>` + cliente.timestamp + `</td>
        </tr>`;
    });
    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Mensajería</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                table, th, td {
                    border: 1px solid black;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 1em;
                }
            </style>
        </head>
        <body>
            <h1>Clientes conectados: </h1>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>IP</th>
                        <th>Puerto</th>
                        <th>Hora de conexión</th>
                    </tr>
                </thead>
                <tbody>
                    `+ clientesConectados + `
                </tbody>
            </table>
        </body>
        </html>`;
}

/* ********SERVIDOR HTTP******** */
var servidorRegistro = http.createServer((req, res) => {
    var parseo, query, direccion, cliente;
    if (req.method == 'GET') {
        parseo = url.parse(req.url, true);
        direccion = parseo.pathname;
        query = parseo.query;
        if (direccion == '/register') {
            try {
                cliente =
                    {
                        username: query.username,
                        ip: query.ip,
                        port: query.port,
                        timestamp: (new Date()).toString()
                    };
                console.log(cliente);
                res.writeHead(200,
                    {
                        'Date': (new Date()).toString(),
                        'Content-Type': 'text/string'
                    });
                res.end(JSON.stringify(registroClientes));
                registroClientes.push(cliente);
            }
            catch (e) {
                console.log(e);
                res.writeHead(404);
                res.end();
            }
        }
        else if (direccion == '/consult') {
            try {
                res.writeHead(200,
                    {
                        'Date': (new Date()).toString(),
                        'Content-Type': 'text/html'
                    });
                res.end(resHTML());
            }
            catch (e) {
                console.log(e);
                res.writeHead(404);
                res.end();
            }
        }
    }
});
servidorRegistro.listen(HTTP_PORT);

/* ********SERVIDOR NTP******** */
var server = net.createServer((sock) => {
    sock.on('data', (data) => {
        var T2 = (new Date()).getTime();
        var T3 = (new Date()).getTime();
        sock.write(data.toString() + ',' + T2.toString() + ',' + T3.toString());
    });
});
server.listen(NTP_PORT, () => {
    console.log('Se ha generado el servidor');
});
server.on('connection', () => {
    console.log('Se han conectado al servidor');
});
server.on('error', () => {
    console.log('Ha ocurrido un error');
});
server.on('close', () => {
    console.log('Se cerro el servidor');
});