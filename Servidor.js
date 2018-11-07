var net = require('net');
var http = require('http');
var url = require('url');

/* ********DECLARACIÓN DE VARIABLES******** */
var NTP_PORT = 687;
var HTTP_PORT = 4887;

var registroClientes = [];

/* ********SERVIDOR HTTP******** */
var servidorRegistro = http.createServer((req, res) =>
{
    var parseo, query, direccion, cliente;
    if (req.method == 'GET')
    {
        parseo = url.parse(req.url, true);
        direccion = parseo.pathname;
        query = parseo.query;
        if (direccion == '/register')
        {
            try
            {
                cliente =
                {
                    username: query.username,
                    ip: query.ip,
                    port: query.port
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
            catch (e)
            {
                console.log(e);
                res.writeHead(404);
                res.end();
            }
        }
    }
});
servidorRegistro.listen(HTTP_PORT);

/* ********SERVIDOR NTP******** */
var server = net.createServer((sock) =>
{
    sock.on('data', (data) =>
    {
        var T2 = (new Date()).getTime();
        var T3 = (new Date()).getTime();
        sock.write(data.toString() + "," + T2.toString() + "," + T3.toString());
    });
    sock.on("end", () =>
    {
        console.log('Se ha desconectado el usuario');
    });
}).listen(NTP_PORT, () =>
{
    console.log('Se ha generado el servidor');
});

server.on('connection', () =>
{
    console.log('Se han conectado al servidor');
})
server.on('error', () =>
{
    console.log('Ha ocurrido un error');
})
server.on('close', () =>
{
    console.log('Se cerro el servidor');
})