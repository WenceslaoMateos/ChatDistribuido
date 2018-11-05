var net = require('net');
var http = require('http');

var ipServidor = '10.9.10.44';
var puertoServidor = 6969;

var delay;
var offset;

/* ******CALCULO DE RELOJES****** */

var cliente = new net.Socket();
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

var username;

//ip y puerto donde va a escuchar
var ip;
var puerto;



http.get("http://" + ipServidor + ":" + puertoServidor + "/register?username=" + username + "&ip=" + ip + "&port=" + puerto, (response) => {
    response.setEncoding('utf8');
    response.on("data", (data) => {
        console.log(data);
    });
});