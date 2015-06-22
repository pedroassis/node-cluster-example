var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send(require('./airports.json'));
});

var server = app.listen(3000, function () {

    // var host = server.address().address;
    // var port = server.address().port;

    // console.log('Example app listening at http://%s:%s', host, port);

});

process.on('message', function () {
    
    server.close(function () {
        process.exit(0);
    });
});