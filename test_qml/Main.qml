import QtQuick 2.4
import QtQuick.Window 2.2

import Controls 1.0

import "../build/Authorization.js" as Authorization

import Tulip 1.0

Item {
    id: root

    width: 800
    height: 600

    property string sslCertificate: ""

    property string sslKey: ""


    Row {
        spacing: 10

        Button {
            text: 'SetTimeout'
            onClicked: {
                console.log('Tick')
                Authorization._setTimeout(function() {
                    console.log('Tack')
                }, 1000)
            }
        }

        Button {
            text: 'OpenBrowser'
            onClicked: Authorization._openBrowser('http://google.com')
        }

        Button {
            text: 'Get OAuth types'
            onClicked: {
                Authorization.setDefaultSettings();
                Authorization.getOAuthServices(function(code, response) {
                    console.log(response);
                })
            }
        }

        Button {
            text: 'OAuthVK'
            onClicked: {
                // start local server for test:
                // node server.js
                Authorization.setup({
                    debug: true,
                    authUrl: 'http://local-auth.protocol.one:3180',
                    timeout: 10000,

                    //localWebSocketUrl: 'wss://connect.gamenet.ru',
                    localWebSocketUrl: 'ws://connect.gamenet.ru',
                    wssCert: root.sslCertificate,
                    wssKey: root.sslKey
                })

                Authorization.loginByOAuth('/oauth/connect/vkontakte', function(code, response) {
                    console.log('Auth code' , code, 'response:\n', JSON.stringify(response, null, 2))
                })
            }
        }
    }

}

