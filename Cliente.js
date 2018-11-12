/* ********DECLARACIÓN DE LIBRERIAS******** */
var net = require('net');
var http = require('http');
var readline = require('readline');
var readlineSync = require('readline-sync');

/* ********DECLARACIÓN DE VARIABLES******** */
var ipServidor;
var NTP_PORT = 687;
var HTTP_PORT = 4887;

var offset;

var username;

var clienteNTP = new net.Socket();
var ipCliente;
var puertoCliente;
var nodos = new Map();
var nodo;


/* ********I/O DE CONSOLA******** */
username = readlineSync.question('Escriba su nombre de usuario: ');
puertoCliente = readlineSync.question('Escriba su numero de puerto: ');
ipCliente = readlineSync.question('Escriba su IP: ');
ipServidor = readlineSync.question('Escriba la IP del servidor: ');

/* ********CALCULO DE RELOJES******** */
clienteNTP.connect(NTP_PORT, ipServidor, () =>
{
    var T1 = (new Date()).getTime();
    clienteNTP.write(T1.toString());
});

clienteNTP.on('data', (data) =>
{
    var T4 = (new Date()).getTime();
    var tiempos = data.toString().split(",");
    var T1 = parseInt(tiempos[0]);
    var T2 = parseInt(tiempos[1]);
    var T3 = parseInt(tiempos[2]);
    offset = ((T2 - T1) + (T3 - T4)) / 2;
    console.log('Offset: ' + offset);
    clienteNTP.destroy();
});

/* ********CREACIÓN DEL NODO******** */
var nodo = net.createServer(socket =>
{
    socket.on('data', data =>
    {
        var datos = JSON.parse(data);
        if ('username' in datos)
        {
            nodos.set(datos.username, new net.Socket());
            nodos.get(datos.username).connect(datos.port, datos.ip, () =>
            {
                console.log('Conectado con ' + datos.username);
            });
        }
        else if ('message' in datos)
        {
            if (datos.to == 'all')
                console.log(datos.from + ': ' + datos.message + ' - ' + new Date(datos.timestamp + datos.offset));
            else if (datos.to == username)
                console.log('[' + datos.from + ']: ' + datos.message + ' - ' + new Date(datos.timestamp + datos.offset));
        }
    })
});
nodo.listen(puertoCliente, () =>
{
    console.log('Recibiendo mensajes en ' + ipCliente + ':' + puertoCliente);
    registroHTTP();
});
nodo.on('connection', () =>
{
    console.log('Usuario conectado');
});

/* ********REGISTRO POR HTTP******** */
function registroHTTP()
{
    http.get("http://" + ipServidor + ":" + HTTP_PORT + "/register?username=" + encodeURIComponent(username) + "&ip=" + encodeURIComponent(ipCliente) + "&port=" + encodeURIComponent(puertoCliente), (response) =>
    {
        response.setEncoding('utf8');
        var datos = "";
        response.on("data", (data) =>
        {
            datos += data.toString();
        });
        response.on("end", () =>
        {
            var conexiones = JSON.parse(datos);
            console.log(conexiones);
            conectarNodos(conexiones);
        });
    }).on("error", (er) =>
    {
        console.log(er.toString());
    });
}

/* ********CONEXIÓN CON NODOS******** */
function conectarNodos(conexiones)
{
    conexiones.forEach(c =>
    {
        let socket = new net.Socket();
        socket.connect(c.port, c.ip, () =>
        {
            console.log('Conectado con ' + c.username);
            socket.write(JSON.stringify(
            {
                username: username,
                ip: ipCliente,
                port: puertoCliente
            }));
            nodos.set(c.username, socket);
        });
        socket.on('error', () => {});
    });
}

/* ********ENVÍO DE MENSAJES******** */
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', (line) =>
{
    var datos = line.split('@');
    var mensaje = {
        from: username,
        to: '',
        message: datos[0],
        timestamp: (new Date()).getTime(),
        offset: offset
    };
    if (datos.length == 1)
    {
        mensaje.to = 'all';
        mensaje = JSON.stringify(mensaje);
        for (const [name, nodo] of nodos.entries())
        {
            try {
                nodo.write(mensaje);
                console.log('Mensaje enviado a ' + name);
            }
            catch (e){
                console.log(name + " se ha desconectado.");
                nodos.delete(name);
            }
        }
    }
    else
    {
        for (var i = 1; i < datos.length; i++)
        {
            try {
                mensaje.to = datos[i];
                var privado = JSON.stringify(mensaje);
                nodos.get(datos[i]).write(privado);
                console.log('Mensaje enviado a ' + datos[i]);
            }
            catch (e){
                console.log(name + " se ha desconectado.");
                nodos.delete(name);
            }
        }
    }
    console.log(username + ': ' + line + ' - ' + new Date(mensaje.timestamp + mensaje.offset));
});