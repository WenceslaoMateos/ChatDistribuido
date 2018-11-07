var net = require('net');
var http = require('http');
var url = require('url');

/* ********DECLARACIÓN DE VARIABLES******** */
//var HOST = '10.9.10.56';
var PORT = 6969;

var delay = 256;

var registroClientes = [];

/* ********OPERACIÓN DE LOS SERVIDORES******** */
var servidorRegistro = http.createServer((req, res) => {
    var parseo, query, resultado, direccion, cliente;
    if (req.method === "GET"){
        parseo = url.parse(req.url, true);
        direccion = parseo.pathname;
        query = parseo.query;
        if (direccion === '/register'){
            try {
                cliente = {
                    username: username,
                    ip: ip,
                    port: port
                };
                console.log(cliente);
                registroClientes.push(cliente);
                res.writeHead(200, {
                    'Date': (new Date()).toString(),
                    'Content-Type': 'text/string'
                });
                res.end(JSON.stringify(registroClientes));
            }
            catch (e){
                console.log(e);
                res.writeHead(404);
                res.end();
            }
        }
    }
});
servidorRegistro.listen(PORT);

/*
var server = net.createServer((sock) => {
    sock.on('data', (data) => {
        var T2 = (new Date()).getTime();
        var T3 = (new Date()).getTime();
        sock.write(data.toString() + "," + T2.toString() + "," + T3.toString());
    });
    sock.on("end", () => {
        console.log('Se ha desconectado el usuario');
    });
}).listen(PORT, () => {
    console.log('Se ha generado el servidor');
});

server.on('connection', () => {
    console.log('Se han conectado al servidor');
})
server.on('error', () => {
    console.log('Ha ocurrido un error');
})
server.on('close', () => {
    console.log('Se cerro el servidor');
})*/