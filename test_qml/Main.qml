import QtQuick 2.4
import QtQuick.Window 2.2

import Controls 1.0

import "../build/Authorization.js" as Authorization

import Tulip 1.0

Item {
    id: root

    width: 800
    height: 600

    property string sslCertificate: "-----BEGIN CERTIFICATE-----
MIIGCTCCBPGgAwIBAgISBHtQ751JRPWa2Y7gZsPqFTtqMA0GCSqGSIb3DQEBCwUA
MEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD
ExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0xODEwMDIxMTAwNDJaFw0x
ODEyMzExMTAwNDJaMBsxGTAXBgNVBAMTEHdzcy5wcm90b2NvbC5vbmUwggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDMKhakdve03FgqEL+ePsZ4MCB+LhaI
uWi8SQWiJWtWjFm06S53H5Z80UM9uQRPwH88PYGjC6RGhqPOk11LHNuEFiHArYfv
r6VwttrNjMaiyVKrNMRE4Jcofb75j3Y+CWIeGNPUYuAqb0OYmXzY9/zyNSK1Te20
o8CQOB9wDUtZCbDM+HjcvyFhxbE9eN18RBugSc/swyZw5EpAt/9niAm5JnmvSG1T
ONe72eFroa5zw+a05EGhpQYePnBhrjOdSFw4u5ufCdbCOnsRS+uvRFIulZYUEY3B
63a1SUpkuIL4u4Nozs78riiwg7aRjuVS3+bcDELJZdZLnGoMDuSW5hAbAgMBAAGj
ggMWMIIDEjAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsG
AQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFHr5tOSjRZb4OKYmkL4Psy9o
zZf1MB8GA1UdIwQYMBaAFKhKamMEfd265tE5t6ZFZe/zqOyhMG8GCCsGAQUFBwEB
BGMwYTAuBggrBgEFBQcwAYYiaHR0cDovL29jc3AuaW50LXgzLmxldHNlbmNyeXB0
Lm9yZzAvBggrBgEFBQcwAoYjaHR0cDovL2NlcnQuaW50LXgzLmxldHNlbmNyeXB0
Lm9yZy8wGwYDVR0RBBQwEoIQd3NzLnByb3RvY29sLm9uZTCB/gYDVR0gBIH2MIHz
MAgGBmeBDAECATCB5gYLKwYBBAGC3xMBAQEwgdYwJgYIKwYBBQUHAgEWGmh0dHA6
Ly9jcHMubGV0c2VuY3J5cHQub3JnMIGrBggrBgEFBQcCAjCBngyBm1RoaXMgQ2Vy
dGlmaWNhdGUgbWF5IG9ubHkgYmUgcmVsaWVkIHVwb24gYnkgUmVseWluZyBQYXJ0
aWVzIGFuZCBvbmx5IGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgQ2VydGlmaWNhdGUg
UG9saWN5IGZvdW5kIGF0IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL3JlcG9zaXRv
cnkvMIIBAgYKKwYBBAHWeQIEAgSB8wSB8ADuAHUAVYHUwhaQNgFK6gubVzxT8MDk
OHhwJQgXL6OqHQcT0wwAAAFmNKbcZAAABAMARjBEAiATvO8ruvPUAqMKv3qud7MN
g2kCjNQAMgsrs4kZdKqqewIgKBaR5qIOEmpPURDN64jwcSwclBOsj5PSqpd4PVwS
dPYAdQApPFGWVMg5ZbqqUPxYB9S3b79Yeily3KTDDPTlRUf0eAAAAWY0ptxPAAAE
AwBGMEQCIAKu9dTnNgm26Jk5DVm/8eOUjWrseU9qvguMst9pM7rtAiBK3W5P2CYR
vFMj3ZaVjffPs1PNDXbzosvBwjS3SSNNpjANBgkqhkiG9w0BAQsFAAOCAQEAgBj0
UD1PJAIDhRbnXv9caOw0TyP2Qin0IrxmpdD4uOQ4lS38kItDGJATNaVAnGnMbHNp
jPP9Wjn60vRkiM/Fxv2mwN/pMzAxi2/plm6F52HUHXHX1h8n3M9WbisQpSQ3H7Fm
Fonp4DnP+6BMYesqSJdjfp4JYwziJc+bK53lBqVPk03BGjHX+fcUx4tXnleK20DW
JX5tSe32SWuOW1tbqIHGHK5pmteatnU1LWjdnhy8ible8s7Z5XwQBEebfEwuBrfJ
fET2yo9iuDdq09uDTseaaQBO7MV0Opx2fbhME+V/8TBb34kHpNmIgQ9BQxUzX9rR
GrfdhHW+YpVqNxDk3A==
-----END CERTIFICATE-----"

    property string sslKey: "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMKhakdve03Fgq
EL+ePsZ4MCB+LhaIuWi8SQWiJWtWjFm06S53H5Z80UM9uQRPwH88PYGjC6RGhqPO
k11LHNuEFiHArYfvr6VwttrNjMaiyVKrNMRE4Jcofb75j3Y+CWIeGNPUYuAqb0OY
mXzY9/zyNSK1Te20o8CQOB9wDUtZCbDM+HjcvyFhxbE9eN18RBugSc/swyZw5EpA
t/9niAm5JnmvSG1TONe72eFroa5zw+a05EGhpQYePnBhrjOdSFw4u5ufCdbCOnsR
S+uvRFIulZYUEY3B63a1SUpkuIL4u4Nozs78riiwg7aRjuVS3+bcDELJZdZLnGoM
DuSW5hAbAgMBAAECggEAD0rzyTv0EAMVQ4lfoQ3YtfX86Rawr2sb8kaR+nRNFv2K
VqfEyD2Aezb9j2kFbqffn/aHeFwN4Q6CxJ17Nn4h30H9Iz6cWRLSFKBNwWnTEyx7
WcGpFfOwvuK0ZGMfm0P+qnx3mYgSfHs7F/ofRO1GcCoUwHnm3UoKyYK6sBz+0Ntr
t9aHM9Bqt0Tqo8eUJtQVPLAlTGwCX14NRHcxVVGe/zPdaj8vTNS1FFN5ZEPouvap
4slW5Y08yL8c1Ohpes5Atca9WY/LNs34U2sBejQ7dGcxSRXSmvU+Mhv4aYmfw0FH
sGrYyjLc/yjFs9GHBtLraxNCy/7j3eOjCZyRNW3zSQKBgQDmGaMYmArKzoE34jFX
G44zGCuIzPzQYskNdxSCmSMXOQ54Cwz20OCuqOGMN1dkgvarBzjmhzUis68xwou8
zS7YPQlk+iiaatFSRbPW/is904lRPtPn5hNlp/2BE7jLPLB/67sxt+CKG0bBn6NS
WCZzU16Kw1B7LwM53i9kWQy+FwKBgQDjJRwqls6X/JNhYkGIBnr59iIIg/1CiBz6
N+j17AR0dxRFiKqQbSvj+Ytodft940ZHcMyyF/qjvjZM23VcagFyqwzXj32/NFti
m8GLef3SxWX7ScnXQWLhKSKPt6Bfm91i1TuaFdW+mfGOcPGG9351QU2dXLgsMGOH
1DJ6xB/knQKBgBuW41llkZWzoQbEVkotgaVato2WlpGd5qF4r7rhBbYZH0UBfjJx
5R7MHQ8k65OfqFfla8soVxSsGsuKmhqvN3iyCNhUrl2lhSeqN+AFZcXqAUL+l4Xs
rlK4C8tYRAYKZtdPuohBlei5UIiSzZBoBWQ6kNFujc3XWzmrDF+p1b9NAoGAQLgF
I3lemd2EXJ3zT/+QsIHZxpVc5sUDhKPDg7ZgupJnOzyqZIZGmCk0+GmNY5wLHTXd
jOzaJCeBLzrkYJVvni1wdkbTLFSNqTX52nTCxngqC4RFt0hRFRh0WYCXeEZfuNZK
qieIhEs2kUBLAQqphF078RdG/og3A6+JRoN1Ft0CgYEAw4AZ2i3q24GXdhM5FQ/p
5F/YMQb2Du8i7gCyIqXgP9j/ddrwk7774yzTYrwxpXwpIMhpzfkmxtHPVfAB/KVA
pWID+3vASnpib/ub6Ptr6Az6LtxHM5sWj7ZtdsJX4lGSXH9OjSS3fJ1NVG5ojyg8
S0NXJbKlcZSsHoVC3GM7L54=
-----END PRIVATE KEY-----"


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

                    localWebSocketUrl: 'wss://wss.protocol.one',
                    //localWebSocketUrl: 'ws://wss.protocol.one',
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

