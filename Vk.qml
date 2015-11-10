import QtQuick 2.4
import QtQuick.Window 2.2

import QtWebEngine 1.1
import QtWebEngine.experimental 1.0

import GameNet.Core 1.0
import GameNet.Controls 1.0
import Application.Core.Styles 1.0

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

    width: 700
    height: 550
    maximumHeight : height
    maximumWidth : width
    minimumHeight : height
    minimumWidth : width

    visible: true
    title: qsTr('WINDOW_TITLE_VK_AUTH')
    flags: Qt.Tool | Qt.WindowStaysOnTopHint
    modality: Qt.ApplicationModal
    onClosing: window.clearCookies();

    WebEngineView {
        id: browser

        signal loadFailedFixed();
        property bool isLoaded: false

        profile {
            // INFO in qt5.6 we can implement this.
            //httpAcceptLanguage: ""
            httpUserAgent: "GNA"
            offTheRecord: true
            persistentCookiesPolicy: WebEngineProfile.NoPersistentCookies
        }

        anchors.fill: parent

        Component.onCompleted: {
            window.clearCookies();
        }

        onLoadingChanged: {
            browser.isLoaded = loadRequest.status == WebEngineView.LoadSucceededStatus;
            if (loadRequest.status == WebEngineView.LoadSucceededStatus) {
                browser.titleChanged();
            }

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

    ImageButton {
        width: 32
        height: 30
        anchors {
            right: parent.right
            rightMargin: 15
            top: parent.top
            topMargin: 9
        }
        style {normal: "#00000000"; hover: "#00000000"; disabled: "#00000000"}
        styleImages {
            normal: installPath + Styles.headerClose
            hover: installPath + Styles.headerClose.replace('.png', 'Hover.png')
        }
        analytics {
            category: 'AuthVK';
            label: 'Header Close'
        }
        onClicked: window.close();
    }

}
