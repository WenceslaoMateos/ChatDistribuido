/* ********DECLARACIÓN DE LIBRERIAS******** */
var net = require('net');
var http = require('http');
var readlineSync = require('readline-sync');
var mqtt = require('mqtt');

/* ********DECLARACIÓN DE VARIABLES******** */
var ipServidor;
var NTP_PORT = 687;
var HTTP_PORT = 4887;

var offset;

var username = 'servo';

var clienteNTP = new net.Socket();
var ipCliente;
var puertoCliente;
var nodos = new Map();
var nodo;

var topicoLED;
var topicoMotor;
var ubicacion;

var ipMQTT = 'mqtt.fi.mdp.edu.ar';
var portMQTT = 1883;
var clienteMQTT;

function validarUbicacion(ubicacion){
    switch(ubicacion){
        case 'sala4':
        case 'exterior':
        case 'pasillo':
            return true;
        default:
            return false;
    }
}

/* ********I/O DE CONSOLA******** */
console.log('Nombre de usuario: ' + username);
puertoCliente = readlineSync.question('Escriba su numero de puerto: ');
ipCliente = readlineSync.question('Escriba su IP: ');
ipServidor = readlineSync.question('Escriba la IP del servidor: ');
do {
    ubicacion = readlineSync.question('Escriba la ubicación de las cosas: ');
} while (!validarUbicacion(ubicacion));
topicoMotor = 'ingenieria/anexo/' + ubicacion + '/motor';
topicoLED = 'ingenieria/anexo/' + ubicacion + '/led';


/* ********CLIENTE MQTT******** */
clienteMQTT = mqtt.connect('mqtt://' + ipMQTT + ':' + portMQTT);
clienteMQTT.on('connect', () => {
    console.log('Conexión exitosa al MQTT');
});

function publicarMQTT(mensaje, timestamp){
    if (mensaje.includes('Prender LED de ' + ubicacion))
        clienteMQTT.publish(topicoLED, JSON.stringify(
            {
                valor: true,
                timestamp: timestamp
            })
        );
    else if(mensaje.includes('Apagar LED de ' + ubicacion))
        clienteMQTT.publish(topicoLED, JSON.stringify(
            {
                valor: false,
                timestamp: timestamp
            })
        );
    else if(mensaje.includes('Girar motor a ')){
        var tokens = mensaje.split(' ');
        try {
            var grados = parseInt(tokens[3]);
            clienteMQTT.publish(topicoMotor, JSON.stringify(
                {
                    valor: grados,
                    timestamp: timestamp
                })
            );
        }
        catch (e){
            console.log(e.toString())
        }
    }
}

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
    let name = '';
    socket.on('data', data =>
    {
        var datos = JSON.parse(data);
        if ('username' in datos)
        {
            name = datos.username;
            nodos.set(name, socket);
            console.log('Conectado con ' + name);
        }
        else if ('message' in datos)
        {
            if (datos.to == username)
            {
                console.log('[' + datos.from + ']: ' + datos.message + ' - ' + new Date(datos.timestamp + datos.offset));
                publicarMQTT(datos.message, datos.timestamp);
            }
        }
    });
    socket.on('error', error =>
    {
        if ( name != '' && nodos.has(name))
        {
            console.log(name + " se ha desconectado.");
            nodos.delete(name);
        }
    });
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
        socket.connect(c.port, c.ip, ipCliente, puertoCliente, () =>
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
        socket.on('data', data =>
        {
            var datos = JSON.parse(data);
            if ('username' in datos)
            {
                nodos.set(datos.username, socket);
                console.log('Conectado con ' + datos.username)
            }
            else if ('message' in datos)
            {
                if (datos.to == username){
                    console.log('[' + datos.from + ']: ' + datos.message + ' - ' + new Date(datos.timestamp + datos.offset));
                    publicarMQTT(datos.message, datos.timestamp);
                }
            }
        });
        socket.on('error', error =>
        {
            if (nodos.has(c.username))
            {
                console.log(c.username + " se ha desconectado.");
                nodos.delete(c.username);
            }
        });
    });
}