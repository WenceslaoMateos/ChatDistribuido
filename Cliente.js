/* ********DECLARACIÓN DE LIBRERIAS******** */
var net = require('net');
var http = require('http');
var readlineSync = require('readline-sync');

/* ********DECLARACIÓN DE VARIABLES******** */
var ipServidor = "10.9.10.120";
var puertoServidor = 6969;

var delay;
var offset;

var username;

//ip y puerto donde va a escuchar
var cliente = new net.Socket();
var ipCliente = cliente.address();
var puertoCliente = 6969;
var connexiones;


/* ************I/O DE CONSOLA*************** */
//var puertoCliente = readlineSync.question('Escriba el puerto del cliente: ');
//var ipServidor = readlineSync.question('Escriba la ip del servidor: ');

/* ******CALCULO DE RELOJES****** */
/*
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

/* *****REGISTRO POR HTTP*** */

http.get("http://" + ipServidor + ":" + puertoServidor + "/register?username=" + username + "&ip=" + ipCliente + "&port=" + puertoCliente, (response) => {
    response.setEncoding('utf8');
    response.on("data", (data) => {
        console.log(data.toString());
        connexiones = JSON.parse(data.toString());
    });
});