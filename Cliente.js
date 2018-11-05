/* ********DECLARACIÓN DE LIBRERIAS******** */
var net = require('net');
var http = require('http');
var readline = require('readline');

/* ********DECLARACIÓN DE VARIABLES******** */
var ipServidor;
var puertoServidor = 6969;

var delay;
var offset;

var username;

//ip y puerto donde va a escuchar
var cliente = new net.Socket();
var ipCliente = cliente.address();
var puertoCliente;
var connexiones;


/* ************I/O DE CONSOLA*************** */
// creado de elementos para lectura por consola de ip y puerto del servidor
var lector = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

lector.question('Escriba el puerto que desea abrir: ', function (r) {
    puertoCliente = r;
    lector.close();
});

lector.question('Escriba la ip del servidor: ', function (r) {
    ipServidor = r;
    lector.close();
});

/* ******CALCULO DE RELOJES****** */

cliente.connect(ipServidor, puertoServidor, () => {
    var T1 = (new Date()).getTime();
    cliente.write(T1.toString());
});

cliente.on('data', (data) => {
    var T4 = (new Date()).getTime();
    var tiempos = data.toString().split(",");
    var T1 = parseInt(tiempos[0]);
    var T2 = parseInt(tiempos[1]);
    var T3 = parseInt(tiempos[2]);
    delay = ((T2 - T1) + (T4 - T3)) / 2;
    offset = ((T2 - T1) + (T3 - T4)) / 2;

    cliente.destroy();
});


/* *****CARTELES DE CONSOLA******* */

cliente.on('close', () => {
    console.log('Conexión cerrada');
});

cliente.on('connect', () => {
    console.log('Se ha establecido una conexión');
});

cliente.on('error', () => {
    console.log('Ha ocurrido un error');
});

/* *****REGISTRO POR HTTP*** */

http.get("http://" + ipServidor + ":" + puertoServidor + "/register?username=" + username + "&ip=" + ipCliente + "&port=" + puertoCliente, (response) => {
    response.setEncoding('utf8');
    response.on("data", (data) => {
        console.log(data.toString());
        connexiones = JSON.parse(data.toString());
    });
});