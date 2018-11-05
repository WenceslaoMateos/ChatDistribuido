var net = require('net');
var http = require('http');
var url = require('url');

/* ********DECLARACIÓN DE VARIABLES******** */
//var HOST = '10.9.10.56';
var PORT = 6969;

var delay = 256;

/* ********DECLARACIÓN DE PROTOTIPOS******** */
function Cliente(username, ip, port){
    this.username = username;
    this.ip = ip;
    this.port = port;

    this.getUsername = () => {
        return this.username;
    }

    this.getIp = () => {
        return this.ip;
    }

    this.getPort = () => {
        return this.port;
    }

    this.toJSON = () => {
        var externo = this;
        return JSON.stringify({
            username: externo.username,
            ip: externo.ip,
            port: externo.port
        });
    }
}

function RegistroClientes(){
    this.clientes = [];

    this.registrarCliente = (cliente) => {
        this.clientes.push(cliente);
    }
    
    this.toJSON = () => {
        var longitud = this.clientes.length;
        var i;
        var res = "[";
        if (longitud > 0){
            for (i = 0; i < longitud - 1; i++)
                res += this.clientes[i].toJSON() + ",";
            res += this.clientes[i].toJSON();
        }
        res += "]";
        return res;
    }
}

var registro = new RegistroClientes();

/* ********OPERACIÓN DE LOS SERVIDORES******** */
var servidorRegistro = http.createServer((req, res) => {
    var parseo, query, resultado, direccion, cliente;
    if (req.method === "GET"){
        parseo = url.parse(req.url, true);
        direccion = parseo.pathname;
        query = parseo.query;
        if (direccion === '/register'){
            try {
                cliente = new Cliente(query.username, query.ip, query.port);
                console.log(cliente);
                registro.registrarCliente(cliente);
                res.writeHead(200, {
                    'Date': (new Date()).toString(),
                    'Content-Length': 2,
                    'Content-Type': 'text/string'
                });
                console.log(registro.toJSON());
                res.end(registro.toJSON());
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