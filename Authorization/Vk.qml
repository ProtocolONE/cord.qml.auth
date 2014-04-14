import QtQuick 1.1
import QtWebKit 1.0
import Tulip 1.0

import '../restapi.js' as RestApi

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
            WebViewHelper.setCookiesFromUrl('', 'https://vk.com')
            WebViewHelper.setCookiesFromUrl('', 'https://login.vk.com')
            WebViewHelper.setCookiesFromUrl('', 'http://gamenet.ru')
            WebViewHelper.setCookiesFromUrl('', 'http://www.gamenet.ru')
            WebViewHelper.setCookiesFromUrl('', 'https://gnlogin.ru')
    }

    width: 640
    height: 480
    visible: true
    title: qsTr('WINDOW_TITLE_VK_AUTH')
    flags: Qt.Tool
    modality: Qt.ApplicationModal
    onBeforeClosed: clearCookies();

    WebView {
        id: browser

        signal loadFailedFixed();

        anchors.fill: parent
        preferredWidth: parent.width
        preferredHeight: parent.height
        settings {
            javascriptEnabled: true
            autoLoadImages: true
            localContentCanAccessRemoteUrls: true
            localStorageDatabaseEnabled: true
            offlineStorageDatabaseEnabled: false
            offlineWebApplicationCacheEnabled: false
        }

        Component.onCompleted: window.clearCookies();
        onLoadFailed: loadFailTimer.start();
        onLoadStarted: loadFailTimer.stop();

        Timer {
            id: loadFailTimer

            interval: 100
            repeat: false
            running: false
            onTriggered: browser.loadFailedFixed();
        }
    }
}
