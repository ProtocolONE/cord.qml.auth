var _timerComponent;
var _webSocketComponent

var _setTimeout = function(callback, timeout, arg1) {
    if (!_timerComponent) {
        _timerComponent = Qt.createComponent('./Timer.qml');
    }

    var cb = function() {
        callback(arg1); // undone use arguments
    }

    var timer = _timerComponent.createObject(null);
    timer.interval = timeout;
    timer.repeat = false;

    timer.triggered.connect(cb);
    timer.triggered.connect(function () {
        timer.triggered.disconnect(cb);
        timer.destroy();
    })

    timer.start();
}

function setUseRealBrowser() {}
var _openBrowser = function(url) {
    return Qt.openUrlExternally(url);
}

var _startWSServer = function(options) {
    if (!_webSocketComponent) {
        _webSocketComponent = Qt.createComponent('./WebSocket.qml');
        if (_webSocketComponent.errorString()) {
            console.log('Websocket error: ', _webSocketComponent.errorString())
        }
    }

    var nullCb = function() {};
    var readyCallback = options.readyCallback || nullCb;
    var messageCallback = options.messageCallback || nullCb;
    var errorCallback = options.errorCallback || nullCb;
    var timeout = options.timeout || 60000;

    var ws = _webSocketComponent.createObject(null);
    ws.timeout = timeout;

    if (options.sslEnabled) {
        ws.wssKey = options.wssKey;
        ws.wssCert = options.wssCert;
        ws.sslEnabled = true;
    }

    ws.ready.connect(readyCallback);
    ws.error.connect(errorCallback);
    ws.textMessage.connect(messageCallback);
    ws.textMessage.connect(function() {
        ws.stop();
        ws.destroy();
    })

    ws.start();
}

var _atob = function(data) {
    return Qt.atob(data);
}



