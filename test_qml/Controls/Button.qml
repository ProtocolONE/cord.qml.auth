import QtQuick 2.4

Rectangle {
    id: control

    property alias enabled: buttonBehavior.enabled

    property alias text: buttonText.text
    property alias textColor: buttonText.color

    property alias fontSize: buttonText.font.pixelSize
    property alias font: buttonText.font

    property bool inProgress: false

    property alias containsMouse: buttonBehavior.containsMouse
    property bool buttonPressed: buttonBehavior.buttonPressed

    signal entered()
    signal exited()
    signal pressed(variant mouse)
    signal clicked(variant mouse)

    color: "#FF4F02"

    implicitWidth: 25 + buttonText.width + 25
    implicitHeight: 48

    function getControlState() {
        if (!control.enabled) {
            return 'Disabled';
        }

        if (control.inProgress) {
            return 'InProgress';
        }

        return control.containsMouse ? 'Hover' : 'Normal';
    }

    Behavior on color {
        PropertyAnimation { duration: 250 }
    }

    Text {
        id: buttonText

        anchors.centerIn: parent
        color: "#FFFFFF"
        font {
            family: "Arial"
            pixelSize: 16
        }
        text: " "
    }

    StateGroup {
        state: control.getControlState()

        states: [
            State {
                name: "Hover"
                PropertyChanges { target: control; color: "#FF7902"}
                PropertyChanges { target: buttonText; visible: true }
            },
            State {
                name: "Normal"
                PropertyChanges { target: control; color: "#FF4F02"}
                PropertyChanges { target: buttonText; visible: true }
            },
            State {
                name: "Disabled"
                PropertyChanges { target: control; color: "#577889"}
                PropertyChanges { target: buttonText; visible: true }
            },
            State {
                name: "InProgress"
                PropertyChanges { target: buttonText; visible: false }
            }
        ]
    }

    ButtonBehavior {
        id: buttonBehavior

        anchors.fill: parent
        visible: control.enabled && !control.inProgress

        onEntered: control.entered();
        onExited: control.exited();
        onPressed: control.pressed(mouse);
        onClicked: control.clicked(mouse);
    }
}
