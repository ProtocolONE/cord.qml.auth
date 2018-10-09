import QtQuick 2.4
import QtWebSockets 1.0

import Tulip 1.0

Item {
    id: server

    signal ready(int port);
    signal error(int code);
    signal textMessage(string message);

    property alias port: ws.port
    property alias timeout: timeoutTimer.interval

    property bool sslEnabled: false
    property alias wssKey: ws.sslKey
    property alias wssCert: ws.sslCertificate

    function stop() {
        retry.stop();
        timeoutTimer.stop();
        ws.listen = false;
    }

    function start() {
        if (ws.listen) {
            server.ready(ws.port)
            return;
        }

        ws.listen = true;
        retry.count = 0;
        retry.restart();
        timeoutTimer.start();
    }

    Timer {
        id: timeoutTimer

        running: false
        repeat: false
        onTriggered: {
            server.stop();
            server.error(5); //Result.Timeout = 5
        }
    }

    Timer {
        id: retry

        property int count: 0
        property int maxRetryCount: 10

        interval: 10
        running: false
        repeat: false
        onTriggered: {
            if (ws.listen === true) {
                server.ready(ws.port)
                return;
            } else {
                ++retry.count;

                if (retry.count >= retry.maxRetryCount) {
                    server.error(5); //Result.Timeout = 5
                    return;
                }

                ws.listen = true;
                retry.restart();
            }
        }
    }

    SslWebSocketServer {
        id: ws

        ssl: server.sslEnabled
               ? SslWebSocketServer.SecureMode
               : SslWebSocketServer.NonSecureMode

        onClientConnected: {
            webSocket.textMessageReceived.connect(server.textMessage);
            webSocket.textMessageReceived.connect(function(message) {
                webSocket.active = false;
                ws.listen = false;
            })

            webSocket.statusChanged.connect(function(status) {
                if (status === WebSocket.Error) {
                    server.error(6); //Result.ServerError = 6;
                }
            })
        }
    }
}
