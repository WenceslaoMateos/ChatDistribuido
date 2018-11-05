var net = require('net');

var HOST = '10.9.10.44';
var PORT = 6969;

var delay = 256;

var cliente = new net.Socket();
cliente.connect(PORT, HOST, () => {

    var T1 = (new Date()).getTime();
    cliente.write(T1.toString());
});

cliente.on('data', (data) => {
    setTimeout(() => {
        var T4 = (new Date()).getTime();

        var tiempos = data.toString().split(",");
        var T1 = parseInt(tiempos[0]);
        var T2 = parseInt(tiempos[1]);
        var T3 = parseInt(tiempos[2]);

        var delay = ((T2 - T1) + (T4 - T3)) / 2;
        var offset = ((T2 - T1) + (T3 - T4)) / 2;

        console.log('Delay:\t\t' + delay + ' ms');
        console.log('Offset:\t\t' + offset + ' ms');
        cliente.destroy();
    }, delay);
});

cliente.on('close', () => {
    console.log('Conexion cerrada');
});

cliente.on('connect', () => {
    console.log('Se ha establecido una conexion');
});

cliente.on('error', () => {
    console.log('Ha ocurrido un error');
});