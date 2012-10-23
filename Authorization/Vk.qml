import QtQuick 1.1
import QtWebKit 1.0
import Tulip 1.0

import '../restapi.js' as RestApi

Window {
    id: window
    width: 640
    height: 480
    visible: true
    title: qsTr('WINDOW_TITLE_VK_AUTH')
    flags: Qt.Tool
    modality: Qt.ApplicationModal

    property alias webView: browser
    function link(code, rp, callback) {
        RestApi.Virality.linkAccount(
            code,
            rp,
            function(response) {callback(true, response);},
            function(response) {callback(false, response);}
        );
    }

    WebView {
        id: browser
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

        Component.onCompleted: WebViewHelper.clearCookies();
    }
}
