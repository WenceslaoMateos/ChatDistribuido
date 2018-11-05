var net = require('net');

//var HOST = '10.9.10.56';
var PORT = 6969;

var delay = 256;

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
})