
var cluster = require('cluster');

var numCPUs = require('os').cpus().length;

var slaves = {};

var restarting = false;

cluster.setupMaster({
    exec: './worker.js'
});

console.log('starting master with PID', process.pid);

function fork (count) {
    return count && cluster.fork() ? fork(count-1) : 0;
}

fork(numCPUs);

cluster.on('fork', function (worker) {
    slaves[worker.id] = worker;
});

cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    delete slaves[worker.id];
    cluster.fork();
});

process.on('SIGHUP', function restartApp() {
    if(!restarting){
        restarting = true;
        console.log('restarting all slaves');
        // important: force node.js to reload all js sources
        delete require.cache;

        var workers = Object.keys(slaves).map(function(id) {
            return slaves[id];
        });

        killAll(workers);
    } else {
        console.log("Already restarting");
    }
});

function killAll (workers) {
    var worker = workers.pop();
    worker.send('s');
    cluster.once('listening', function () {
        restarting = workers.length && killAll(workers);
    });
    return true;
}
