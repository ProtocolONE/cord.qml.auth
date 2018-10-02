const { URL, URLSearchParams } = require('url');
const W3CWebSocket = require('websocket').w3cwebsocket;
const _http = require('http');

let TestCase = require('njsunit').TestCase;

let Auth = require('../build/Authorization.Test.js'),
    http = Auth.http,
    Uri = Auth.Uri;

var _server = undefined;
var _reseponse = undefined;
var _path = undefined;

function requestHandler (request, response) {
    const fullRequestUrl = new URL(`http://127.0.0.1${request.url}`);
    if (fullRequestUrl.pathname === _path) {
        let dst = new URL('http://127.0.0.1' + fullRequestUrl.searchParams.get('_destination'));
        let wsUrl = dst.searchParams.get('wsUrl');
        let client = new W3CWebSocket(wsUrl);

        client.onopen = function() {
            client.send(_reseponse);
            client.close();
        }
    }
}

class OAuthTestCase extends TestCase {
    static testCaseTimeout() {
        return 10000;
    }

    setUp() {
        Auth.disableLog();
        Auth.setDefaultSettings();
        _server = _http.createServer(requestHandler);
    }

    tearDown() {
        _server.close();
        _server = undefined;
    }

    testGetOAuthServices (queue) {
        let uri, query;

        //Auth.enableLog();
        Auth.getOAuthServices((result, response) => {
            this.assertEqual(Auth.Result.Success, result);
            queue();
        });
    }

    testOAuthServicesSuccess (queue) {
        //Auth.enableLog();
        Auth.setUseRealBrowser(false);

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
        });

        var _self = this;

        _server.listen ( () => {
            var port = _server.address().port;

            Auth.setup({
                authUrl: `http://127.0.0.1:${port}`,
                timeout: 10000
            })

            Auth.loginByOAuth('/oauth/connect/vkontakte', function (result, response) {
                _self.assertEqual(Auth.Result.Success, result);
                _server.close();
                queue();
            });
        })
    }

    testOAuthServicesTimeout (queue) {
        //Auth.enableLog();
        Auth.setUseRealBrowser(false);

        _path = '/oauth/connect/vkontakte_wrongpath';
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
        });

        var _self = this;

        _server.listen ( () => {
            var port = _server.address().port;

            Auth.setup({
                authUrl: `http://127.0.0.1:${port}`,
                timeout: 1000
            })

            Auth.loginByOAuth('/oauth/connect/vkontakte', function (result, response) {
                _self.assertEqual(Auth.Result.Timeout, result);
                _server.close();
                queue();
            });
        })
    }

    testOAuthServicesError (queue) {
        //Auth.enableLog();
        Auth.setUseRealBrowser(false);

        _path = '/oauth/connect/vkontakte';
        _reseponse = JSON.stringify({
            "event": 'oauthCompletedWithError'
        });

        var _self = this;

        _server.listen ( () => {
            var port = _server.address().port;

            Auth.setup({
                authUrl: `http://127.0.0.1:${port}`,
                timeout: 10000
            })

            Auth.loginByOAuth('/oauth/connect/vkontakte', function (result, response) {
                _self.assertEqual(Auth.Result.ServerError, result);
                _server.close();
                queue();
            });
        })
    }

    testOAuthServicesBadResponse (queue) {
        //Auth.enableLog();
        Auth.setUseRealBrowser(false);

        _path = '/oauth/connect/vkontakte';
        _reseponse = JSON.stringify({
            "event": 'oauthCompletedSuccessfully',
            "message": {
                "accessToken2": {
                    "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1Mzg0NTI0NjEsImV4cCI6MTUzODQ1NDI2MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlkIjoiNWJhZGZkM2Y3MmE2NTA1YWQwMDA3ZDAwIn0.LMdHx_5pbe3eBnPKv5hzj-UFM5wVANaAsi5BylEhuL9mriiCUy7RxhsvXD5BhqM-2peq0_5aSIpzr-LXT0yOEd6rqI0uSwJquaKZKXr6-1bf7Bs9UQxpfXCjNch47wUv0NXIlLnYCnTd4C5767O2L_wA3i2dfU37_nlcpXnswitbWRL6v8DJnqhNnn4-HChQhDOoxgF7YGSeoooc7P6YOV2PtWdZLujivyyIt7exqBhHavI9SfyeHyMkjvfDDfXonSYBcrZZRSDmTQpSCF5cWcHcr7XhnWseqiYFTL-BCVCc_qdogxfWQLS9l3-o237Jqp9BjKQXez__QJJgxgheQ-e0NjgUK-GTSN-Qo3Dp-HXcZLltnl5QqISa7iv2UaTbvY_7tsE6pZyinyXJYxD7-7rLuIJ676gQ3zjw2w87R9UoYzjeq6EbZK8CSSOVaS1_l4-xTySbxBdR29HhbBOb_JmAC-VuZLWOkA0fHjRieQpf5xqfhn0r417sReS523oArJecyVmK1eqlavjBshsjXBOFmXCBXAEGDph2Igacls1acS9quf5wBNJBpX0S_2VpkpBLuRbaObNJeiMBZQQw5sh23oCWkw9L_CpM-uFSqpWSkPo7aqv_p2kolahpjhMesM4ymx0MnzPeVdSYnPXj9izYnRiw3YMcLyj-Fet2rIs",
                    "exp": "1538454261"
                },
                "refreshToken2": {
                    "value": "bb77e0b0d3a23f9065a6fa3a6697bda82f9347752115fdc63127edd132e260cf5fedcf6a80540290950b6446a31904b4820f9f9f721d47a46b041449b9660359657485ee87f44f6fe796a4e2ebe7c265db27b15fa10e8900712591866a49bd4066de3f4b626e0762cb88c7740daf7308991535a794cc556753f7f9fcd2677c88",
                    "exp": "1570009387"
                }
            }
        });

        var _self = this;

        _server.listen ( () => {
            var port = _server.address().port;

            Auth.setup({
                authUrl: `http://127.0.0.1:${port}`,
                timeout: 10000
            })

            Auth.loginByOAuth('/oauth/connect/vkontakte', function (result, response) {
                _self.assertEqual(Auth.Result.BadResponse, result);
                _server.close();
                queue();
            });
        })
    }

};

module.exports = OAuthTestCase;
