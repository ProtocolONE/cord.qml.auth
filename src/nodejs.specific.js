var opn = require('opn');
var _http = require('http');
var WebSocketServer = require('websocket').server;

var _setTimeout = setTimeout;

var _useRealBrowser = true;
var setUseRealBrowser = function (value) {
    _useRealBrowser = value;
}

var _openBrowser = function(url) {
    if (_useRealBrowser) {
        return opn(url);
    }

    _http.get(url, function(resp) {
    });
}

var _startWSServer = function(options) {
    var nullCb = function() {};
    var readyCallback = options.readyCallback || nullCb;
    var messageCallback = options.messageCallback || nullCb;
    var errorCallback = options.errorCallback || nullCb;
    var timeout = options.timeout || 60000;

    var timeoutId;
    var server = _http.createServer(function(request, response) {
        response.writeHead(404);
        response.end();
    });

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true
    });

    wsServer.on('connect', function (connection) {
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                clearTimeout(timeoutId);
                wsServer.shutDown();
                server.close();
                messageCallback(message.utf8Data);
            }
        });

        connection.on('close', function(reasonCode, description) {
            clearTimeout(timeoutId);
            wsServer.shutDown();
            server.close();
        });
    });

    timeoutId = setTimeout(function() {
        wsServer.shutDown();
        server.close();
        errorCallback(Result.Timeout);
    }, timeout);

    server.listen(function() {
        readyCallback(server.address().port);
    });
}
