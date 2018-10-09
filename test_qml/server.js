const { URL, URLSearchParams } = require('url');
const W3CWebSocket = require('websocket').w3cwebsocket;
var WebSocketClient = require('websocket').client;


const _http = require('http');
const _https = require('https');

var ca = '-----BEGIN CERTIFICATE-----\n' +
    'MIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA/\n' +
    'MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\n' +
    'DkRTVCBSb290IENBIFgzMB4XDTE2MDMxNzE2NDA0NloXDTIxMDMxNzE2NDA0Nlow\n' +
    'SjELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUxldCdzIEVuY3J5cHQxIzAhBgNVBAMT\n' +
    'GkxldCdzIEVuY3J5cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOC\n' +
    'AQ8AMIIBCgKCAQEAnNMM8FrlLke3cl03g7NoYzDq1zUmGSXhvb418XCSL7e4S0EF\n' +
    'q6meNQhY7LEqxGiHC6PjdeTm86dicbp5gWAf15Gan/PQeGdxyGkOlZHP/uaZ6WA8\n' +
    'SMx+yk13EiSdRxta67nsHjcAHJyse6cF6s5K671B5TaYucv9bTyWaN8jKkKQDIZ0\n' +
    'Z8h/pZq4UmEUEz9l6YKHy9v6Dlb2honzhT+Xhq+w3Brvaw2VFn3EK6BlspkENnWA\n' +
    'a6xK8xuQSXgvopZPKiAlKQTGdMDQMc2PMTiVFrqoM7hD8bEfwzB/onkxEz0tNvjj\n' +
    '/PIzark5McWvxI0NHWQWM6r6hCm21AvA2H3DkwIDAQABo4IBfTCCAXkwEgYDVR0T\n' +
    'AQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAYYwfwYIKwYBBQUHAQEEczBxMDIG\n' +
    'CCsGAQUFBzABhiZodHRwOi8vaXNyZy50cnVzdGlkLm9jc3AuaWRlbnRydXN0LmNv\n' +
    'bTA7BggrBgEFBQcwAoYvaHR0cDovL2FwcHMuaWRlbnRydXN0LmNvbS9yb290cy9k\n' +
    'c3Ryb290Y2F4My5wN2MwHwYDVR0jBBgwFoAUxKexpHsscfrb4UuQdf/EFWCFiRAw\n' +
    'VAYDVR0gBE0wSzAIBgZngQwBAgEwPwYLKwYBBAGC3xMBAQEwMDAuBggrBgEFBQcC\n' +
    'ARYiaHR0cDovL2Nwcy5yb290LXgxLmxldHNlbmNyeXB0Lm9yZzA8BgNVHR8ENTAz\n' +
    'MDGgL6AthitodHRwOi8vY3JsLmlkZW50cnVzdC5jb20vRFNUUk9PVENBWDNDUkwu\n' +
    'Y3JsMB0GA1UdDgQWBBSoSmpjBH3duubRObemRWXv86jsoTANBgkqhkiG9w0BAQsF\n' +
    'AAOCAQEA3TPXEfNjWDjdGBX7CVW+dla5cEilaUcne8IkCJLxWh9KEik3JHRRHGJo\n' +
    'uM2VcGfl96S8TihRzZvoroed6ti6WqEBmtzw3Wodatg+VyOeph4EYpr/1wXKtx8/\n' +
    'wApIvJSwtmVi4MFU5aMqrSDE6ea73Mj2tcMyo5jMd6jmeWUHK8so/joWUoHOUgwu\n' +
    'X4Po1QYz+3dszkDqMp4fklxBwXRsW10KXzPMTZ+sOPAveyxindmjkW8lGy+QsRlG\n' +
    'PfZ+G6Z6h7mjem0Y+iWlkYcV4PIWL1iwBi8saCbGS5jN2p8M+X+Q7UNKEkROb3N6\n' +
    'KOqkqm57TH2H3eDJAkSnh6/DNFu0Qg==\n' +
    '-----END CERTIFICATE-----\n';
//_https.globalAgent.options.ca = [ca];

var cert = '-----BEGIN CERTIFICATE-----\n' +
    'MIIGCTCCBPGgAwIBAgISBHtQ751JRPWa2Y7gZsPqFTtqMA0GCSqGSIb3DQEBCwUA\n' +
    'MEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD\n' +
    'ExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0xODEwMDIxMTAwNDJaFw0x\n' +
    'ODEyMzExMTAwNDJaMBsxGTAXBgNVBAMTEHdzcy5wcm90b2NvbC5vbmUwggEiMA0G\n' +
    'CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDMKhakdve03FgqEL+ePsZ4MCB+LhaI\n' +
    'uWi8SQWiJWtWjFm06S53H5Z80UM9uQRPwH88PYGjC6RGhqPOk11LHNuEFiHArYfv\n' +
    'r6VwttrNjMaiyVKrNMRE4Jcofb75j3Y+CWIeGNPUYuAqb0OYmXzY9/zyNSK1Te20\n' +
    'o8CQOB9wDUtZCbDM+HjcvyFhxbE9eN18RBugSc/swyZw5EpAt/9niAm5JnmvSG1T\n' +
    'ONe72eFroa5zw+a05EGhpQYePnBhrjOdSFw4u5ufCdbCOnsRS+uvRFIulZYUEY3B\n' +
    '63a1SUpkuIL4u4Nozs78riiwg7aRjuVS3+bcDELJZdZLnGoMDuSW5hAbAgMBAAGj\n' +
    'ggMWMIIDEjAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsG\n' +
    'AQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFHr5tOSjRZb4OKYmkL4Psy9o\n' +
    'zZf1MB8GA1UdIwQYMBaAFKhKamMEfd265tE5t6ZFZe/zqOyhMG8GCCsGAQUFBwEB\n' +
    'BGMwYTAuBggrBgEFBQcwAYYiaHR0cDovL29jc3AuaW50LXgzLmxldHNlbmNyeXB0\n' +
    'Lm9yZzAvBggrBgEFBQcwAoYjaHR0cDovL2NlcnQuaW50LXgzLmxldHNlbmNyeXB0\n' +
    'Lm9yZy8wGwYDVR0RBBQwEoIQd3NzLnByb3RvY29sLm9uZTCB/gYDVR0gBIH2MIHz\n' +
    'MAgGBmeBDAECATCB5gYLKwYBBAGC3xMBAQEwgdYwJgYIKwYBBQUHAgEWGmh0dHA6\n' +
    'Ly9jcHMubGV0c2VuY3J5cHQub3JnMIGrBggrBgEFBQcCAjCBngyBm1RoaXMgQ2Vy\n' +
    'dGlmaWNhdGUgbWF5IG9ubHkgYmUgcmVsaWVkIHVwb24gYnkgUmVseWluZyBQYXJ0\n' +
    'aWVzIGFuZCBvbmx5IGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgQ2VydGlmaWNhdGUg\n' +
    'UG9saWN5IGZvdW5kIGF0IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL3JlcG9zaXRv\n' +
    'cnkvMIIBAgYKKwYBBAHWeQIEAgSB8wSB8ADuAHUAVYHUwhaQNgFK6gubVzxT8MDk\n' +
    'OHhwJQgXL6OqHQcT0wwAAAFmNKbcZAAABAMARjBEAiATvO8ruvPUAqMKv3qud7MN\n' +
    'g2kCjNQAMgsrs4kZdKqqewIgKBaR5qIOEmpPURDN64jwcSwclBOsj5PSqpd4PVwS\n' +
    'dPYAdQApPFGWVMg5ZbqqUPxYB9S3b79Yeily3KTDDPTlRUf0eAAAAWY0ptxPAAAE\n' +
    'AwBGMEQCIAKu9dTnNgm26Jk5DVm/8eOUjWrseU9qvguMst9pM7rtAiBK3W5P2CYR\n' +
    'vFMj3ZaVjffPs1PNDXbzosvBwjS3SSNNpjANBgkqhkiG9w0BAQsFAAOCAQEAgBj0\n' +
    'UD1PJAIDhRbnXv9caOw0TyP2Qin0IrxmpdD4uOQ4lS38kItDGJATNaVAnGnMbHNp\n' +
    'jPP9Wjn60vRkiM/Fxv2mwN/pMzAxi2/plm6F52HUHXHX1h8n3M9WbisQpSQ3H7Fm\n' +
    'Fonp4DnP+6BMYesqSJdjfp4JYwziJc+bK53lBqVPk03BGjHX+fcUx4tXnleK20DW\n' +
    'JX5tSe32SWuOW1tbqIHGHK5pmteatnU1LWjdnhy8ible8s7Z5XwQBEebfEwuBrfJ\n' +
    'fET2yo9iuDdq09uDTseaaQBO7MV0Opx2fbhME+V/8TBb34kHpNmIgQ9BQxUzX9rR\n' +
    'GrfdhHW+YpVqNxDk3A==\n' +
    '-----END CERTIFICATE-----\n'

var key = '-----BEGIN PRIVATE KEY-----\n' +
    'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMKhakdve03Fgq\n' +
    'EL+ePsZ4MCB+LhaIuWi8SQWiJWtWjFm06S53H5Z80UM9uQRPwH88PYGjC6RGhqPO\n' +
    'k11LHNuEFiHArYfvr6VwttrNjMaiyVKrNMRE4Jcofb75j3Y+CWIeGNPUYuAqb0OY\n' +
    'mXzY9/zyNSK1Te20o8CQOB9wDUtZCbDM+HjcvyFhxbE9eN18RBugSc/swyZw5EpA\n' +
    't/9niAm5JnmvSG1TONe72eFroa5zw+a05EGhpQYePnBhrjOdSFw4u5ufCdbCOnsR\n' +
    'S+uvRFIulZYUEY3B63a1SUpkuIL4u4Nozs78riiwg7aRjuVS3+bcDELJZdZLnGoM\n' +
    'DuSW5hAbAgMBAAECggEAD0rzyTv0EAMVQ4lfoQ3YtfX86Rawr2sb8kaR+nRNFv2K\n' +
    'VqfEyD2Aezb9j2kFbqffn/aHeFwN4Q6CxJ17Nn4h30H9Iz6cWRLSFKBNwWnTEyx7\n' +
    'WcGpFfOwvuK0ZGMfm0P+qnx3mYgSfHs7F/ofRO1GcCoUwHnm3UoKyYK6sBz+0Ntr\n' +
    't9aHM9Bqt0Tqo8eUJtQVPLAlTGwCX14NRHcxVVGe/zPdaj8vTNS1FFN5ZEPouvap\n' +
    '4slW5Y08yL8c1Ohpes5Atca9WY/LNs34U2sBejQ7dGcxSRXSmvU+Mhv4aYmfw0FH\n' +
    'sGrYyjLc/yjFs9GHBtLraxNCy/7j3eOjCZyRNW3zSQKBgQDmGaMYmArKzoE34jFX\n' +
    'G44zGCuIzPzQYskNdxSCmSMXOQ54Cwz20OCuqOGMN1dkgvarBzjmhzUis68xwou8\n' +
    'zS7YPQlk+iiaatFSRbPW/is904lRPtPn5hNlp/2BE7jLPLB/67sxt+CKG0bBn6NS\n' +
    'WCZzU16Kw1B7LwM53i9kWQy+FwKBgQDjJRwqls6X/JNhYkGIBnr59iIIg/1CiBz6\n' +
    'N+j17AR0dxRFiKqQbSvj+Ytodft940ZHcMyyF/qjvjZM23VcagFyqwzXj32/NFti\n' +
    'm8GLef3SxWX7ScnXQWLhKSKPt6Bfm91i1TuaFdW+mfGOcPGG9351QU2dXLgsMGOH\n' +
    '1DJ6xB/knQKBgBuW41llkZWzoQbEVkotgaVato2WlpGd5qF4r7rhBbYZH0UBfjJx\n' +
    '5R7MHQ8k65OfqFfla8soVxSsGsuKmhqvN3iyCNhUrl2lhSeqN+AFZcXqAUL+l4Xs\n' +
    'rlK4C8tYRAYKZtdPuohBlei5UIiSzZBoBWQ6kNFujc3XWzmrDF+p1b9NAoGAQLgF\n' +
    'I3lemd2EXJ3zT/+QsIHZxpVc5sUDhKPDg7ZgupJnOzyqZIZGmCk0+GmNY5wLHTXd\n' +
    'jOzaJCeBLzrkYJVvni1wdkbTLFSNqTX52nTCxngqC4RFt0hRFRh0WYCXeEZfuNZK\n' +
    'qieIhEs2kUBLAQqphF078RdG/og3A6+JRoN1Ft0CgYEAw4AZ2i3q24GXdhM5FQ/p\n' +
    '5F/YMQb2Du8i7gCyIqXgP9j/ddrwk7774yzTYrwxpXwpIMhpzfkmxtHPVfAB/KVA\n' +
    'pWID+3vASnpib/ub6Ptr6Az6LtxHM5sWj7ZtdsJX4lGSXH9OjSS3fJ1NVG5ojyg8\n' +
    'S0NXJbKlcZSsHoVC3GM7L54=\n' +
    '-----END PRIVATE KEY-----\n';

var _server = undefined;
var _reseponse = undefined;
var _path = undefined;

_path = '/oauth/connect/vkontakte';
_reseponse = JSON.stringify({
    "event": 'oauthCompletedSuccessfully',
    "message": {
        "accessToken": {
            "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1Mzg0NTI0NjEsImV4cCI6MTUzODQ1NDI2MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlkIjoiNWJhZGZkM2Y3MmE2NTA1YWQwMDA3ZDAwIn0.LMdHx_5pbe3eBnPKv5hzj-UFM5wVANaAsi5BylEhuL9mriiCUy7RxhsvXD5BhqM-2peq0_5aSIpzr-LXT0yOEd6rqI0uSwJquaKZKXr6-1bf7Bs9UQxpfXCjNch47wUv0NXIlLnYCnTd4C5767O2L_wA3i2dfU37_nlcpXnswitbWRL6v8DJnqhNnn4-HChQhDOoxgF7YGSeoooc7P6YOV2PtWdZLujivyyIt7exqBhHavI9SfyeHyMkjvfDDfXonSYBcrZZRSDmTQpSCF5cWcHcr7XhnWseqiYFTL-BCVCc_qdogxfWQLS9l3-o237Jqp9BjKQXez__QJJgxgheQ-e0NjgUK-GTSN-Qo3Dp-HXcZLltnl5QqISa7iv2UaTbvY_7tsE6pZyinyXJYxD7-7rLuIJ676gQ3zjw2w87R9UoYzjeq6EbZK8CSSOVaS1_l4-xTySbxBdR29HhbBOb_JmAC-VuZLWOkA0fHjRieQpf5xqfhn0r417sReS523oArJecyVmK1eqlavjBshsjXBOFmXCBXAEGDph2Igacls1acS9quf5wBNJBpX0S_2VpkpBLuRbaObNJeiMBZQQw5sh23oCWkw9L_CpM-uFSqpWSkPo7aqv_p2kolahpjhMesM4ymx0MnzPeVdSYnPXj9izYnRiw3YMcLyj-Fet2rIs",
            "exp": "1538454261"
        },
        "refreshToken": {
            "value": "bb77e0b0d3a23f9065a6fa3a6697bda82f9347752115fdc63127edd132e260cf5fedcf6a80540290950b6446a31904b4820f9f9f721d47a46b041449b9660359657485ee87f44f6fe796a4e2ebe7c265db27b15fa10e8900712591866a49bd4066de3f4b626e0762cb88c7740daf7308991535a794cc556753f7f9fcd2677c88",
            "exp": "1570009387"
        }
    }
}, null ,2);


function requestHandler (request, response) {
    const fullRequestUrl = new URL(`http://127.0.0.1${request.url}`);
    var body = 'Request: ' +  request.url + "\n";
    if (fullRequestUrl.pathname === _path) {
        let dst = new URL('http://127.0.0.1' + fullRequestUrl.searchParams.get('_destination'));
        let wsUrl = dst.searchParams.get('wsUrl');

         body += 'Connect to web socket: ' + wsUrl + '\n';
         body += 'WS message: ' + _reseponse;

        var client = new WebSocketClient({
                    tlsOptions: {
                        rejectUnauthorized: false,
                    }
                }
            );
        //var client = new WebSocketClient();

        client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });

        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });

            connection.on('close', function() {
                console.log('Connection Closed');
            });


            connection.send(_reseponse);
            connection.close();
        });

        client.connect(wsUrl);
    }

    response.end(body);
}

_server = _http.createServer(requestHandler);

_server.listen (3180, () => {
    var port = _server.address().port;
    console.log(`Started at port ${port}`)
})
