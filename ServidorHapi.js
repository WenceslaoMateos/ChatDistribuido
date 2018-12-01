var net = require('net');
var hapi = require('hapi');

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
var servidorRegistro = hapi.server({
    port: HTTP_PORT
});
servidorRegistro.route({
    method: 'GET',
    path: '/register',
    handler: (req, res) => {
        var cliente, response;
        try {
            cliente =
                {
                    username: req.query.username,
                    ip: req.query.ip,
                    port: req.query.port,
                    timestamp: (new Date()).toString()
                };
            console.log(cliente);
            response = res.response(JSON.stringify(registroClientes));
            registroClientes.push(cliente);
        }
        catch (e) {
            console.log(e);
            response = res.response().code(404);
        }
        return response;
    }
});
servidorRegistro.route({
    method: 'GET',
    path: '/consult',
    handler: (req, res) => {
        try {
            response = res.response(resHTML());
        }
        catch (e) {
            console.log(e);
            response = res.response().code(404);
        }
        return response;
    }
});

var init = async () => {
    await servidorRegistro.start();
    console.log('Se ha generado el servidor HTTP');
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

/* ********SERVIDOR NTP******** */
var server = net.createServer((sock) => {
    sock.on('data', (data) => {
        var T2 = (new Date()).getTime();
        var T3 = (new Date()).getTime();
        sock.write(data.toString() + ',' + T2.toString() + ',' + T3.toString());
    });
});
server.listen(NTP_PORT, () => {
    console.log('Se ha generado el servidor NTP');
});
server.on('connection', () => {
    console.log('Se han conectado al servidor NTP');
});
server.on('error', () => {
    console.log('Ha ocurrido un error en el servidor NTP');
});
server.on('close', () => {
    console.log('Se cerro el servidor NTP');
});