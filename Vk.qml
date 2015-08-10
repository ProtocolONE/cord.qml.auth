import QtQuick 2.4
import QtQuick.Window 2.2

import QtWebEngine 1.1
import QtWebEngine.experimental 1.0

import GameNet.Core 1.0

import Tulip 1.0

Window {
    id: window

    property alias webView: browser

    function link(code, rp, callback) {
        RestApi.Virality.linkAccount(
            code,
            rp,
            function(response) {callback(true, response);},
            function(response) {callback(false, response);}
        );
    }

    function clearCookies() {
        browser.profile.updateCookie();
    }

    width: 640
    height: 480
    visible: true
    title: qsTr('WINDOW_TITLE_VK_AUTH')
    flags: Qt.Tool | Qt.WindowStaysOnTopHint
    modality: Qt.ApplicationModal
    onClosing: window.clearCookies();

    WebEngineView {
        id: browser

        signal loadFailedFixed();

        profile {
            httpUserAgent: "GNA"
            offTheRecord: true
            persistentCookiesPolicy: WebEngineProfile.NoPersistentCookies
        }

        anchors.fill: parent

        Component.onCompleted: {
            window.clearCookies();
        }

        onLoadingChanged: {
            if (loadRequest.status == WebEngineView.LoadStartedStatus) {
                loadFailTimer.stop();
                return
            }

            if (loadRequest.status == WebEngineView.LoadFailedStatus) {
                loadFailTimer.start();
                return;
            }
        }

        Timer {
            id: loadFailTimer

            interval: 100
            repeat: false
            running: false
            onTriggered: browser.loadFailedFixed();
        }
    }
}
