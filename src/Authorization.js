//Replaced during CI build
var authLibVersion = "@VERSION"
    , _authBaseUrl = 'https://p1_auth.eu.gamenet.ru'
    , _apiVersion = 'v1'
    , _authUrl = 'https://p1_auth.eu.gamenet.ru/api/v1/'
    , _hwid
    , _mid
    , _captcha
    , _timeout
    , _localWebSocketUrl = 'ws://127.0.0.1'
    , _wssCert
    , _wssKey
    , _useWSS = false
;

var Result = function() {};
Result.Error = 0;
Result.Success = 1;
Result.InvalidUserNameOrPassword = 2;
Result.CaptchaRequired = 3;
Result.TemporaryLock = 4;
Result.Timeout = 5;
Result.ServerError = 6;
Result.BadResponse = 7;

function setup(options) {
    _hwid = options.hwid || '';
    _mid = options.mid || '';
    _authBaseUrl = options.authUrl || _authBaseUrl;
    _apiVersion = options.authVersion || _apiVersion;
    _authUrl = _authBaseUrl + '/api/' + _apiVersion + '/';
    _timeout = options.timeout || 60000;

    _localWebSocketUrl = options.localWebSocketUrl || _localWebSocketUrl;
    _wssCert = options.wssCert || _wssCert;
    _wssKey = options.wssKey || _wssKey;
     _useWSS = _localWebSocketUrl.substring(0, 3) === 'wss';

    if (options.debug) {
        http.logRequest = true
    }
}

function setDefaultSettings() {
    setUseRealBrowser(true);
    setup({
        hwid: '',
        mid: '',
        authUrl: 'https://p1_auth.eu.gamenet.ru',
        authVersion: 'v1'
    });
}

function getCaptchaImageSource(login) {
    var url = new Uri(_authUrl+'captcha/login/')
        .addQueryParam('r', Math.random())
        .addQueryParam('email', login);

    return url.toString();
}

function getOAuthServices(callback) {
    var request = new Uri(_authUrl+'oauth/sources'),
        options = {
        method: "get",
        uri: request
        }
        , httpStatusToResultMap
        , result = 0
        , msg;


    httpStatusToResultMap = {
        200 : Result.Success,
        400 : Result.InvalidUserNameOrPassword,
        429 : Result.CaptchaRequired,
        426 : Result.TemporaryLock,
    }

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        msg = response.body;
        try {
            msg = JSON.parse(msg);
        } catch (e) {
        }

        callback(result, msg);
    });
}

function _validateAuthResponse(response) {
    return !!response
        && response.hasOwnProperty('accessToken')
        && response.hasOwnProperty('refreshToken')
        && response.accessToken.hasOwnProperty('value')
        && response.refreshToken.hasOwnProperty('value')
        && response.accessToken.hasOwnProperty('exp')
        && response.refreshToken.hasOwnProperty('exp');
}

function _callAuthCallback(response, result, callback) {
    var msg = response;
    try {
        msg = JSON.parse(response);
    } catch (e) {
    }

    if (result != Result.Success) {
        callback(result, msg);
        return;
    }

    if (!_validateAuthResponse(msg)) {
        callback(Result.BadResponse, msg);
        return;
    }

    callback(result, msg);
}

function loginByOAuth(type, callback) {
    var url = _authBaseUrl + type;

    function ready(port) {

        var ws = _localWebSocketUrl + ':' + port;
        var authUrl = url + '?_destination='
            + encodeURIComponent('/api/v1/oauth/result/websocket?wsUrl='+ws);

        if (http.logRequest) {
            console.log('WS opened on port: ' + port);
            console.log('Open external browser with url:', authUrl);
        }

        _openBrowser(authUrl);
    }

    function error(type) {
        callback(type);
    }

    function messageReceived(msg) {
        if (http.logRequest) {
            console.log('WS messageReceived', msg)
        }

        try {
            msg = JSON.parse(msg);
        } catch (e) {
        }

        if (msg.event !== 'oauthCompletedSuccessfully') {
            callback(Result.ServerError, msg);
            return;
        }

        if (!_validateAuthResponse(msg.message)) {
            callback(Result.BadResponse, msg);
            return;
        }

        callback(Result.Success, msg.message);
    }

    _startWSServer({
        readyCallback: ready,
        messageCallback:  messageReceived,
        errorCallback: error,
        timeout: _timeout,
        sslEnabled: _useWSS,
        wssCert: _wssCert,
        wssKey: _wssKey
    })
}

function registerUser(email, password, callback) {
    var request = new Uri(_authUrl+'user/create'),
        options = {
            method: "post",
            uri: request
        }
        , httpStatusToResultMap
        , result = 0;


    httpStatusToResultMap = {
        200 : Result.Success,
        400 : Result.InvalidUserNameOrPassword,
    }

    options.post = JSON.stringify({
        email: email,
        password: password,
        readEula: true
    })

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        _callAuthCallback(response, result, callback);
    });
}

function login(email, password, captcha, callback) {
    var request = new Uri(_authUrl+'user/login'),
        options = {
            method: "post",
            uri: request
        }
        , httpStatusToResultMap
        , result = 0;

    httpStatusToResultMap = {
        200 : Result.Success,
        400 : Result.InvalidUserNameOrPassword,
        429 : Result.CaptchaRequired,
        426 : Result.TemporaryLock,
    }

    options.post = JSON.stringify({
        email: email,
        password: password,
        captcha: captcha
    })

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        _callAuthCallback(response.body, result, callback);
    });
}

function requestPasswordResetCode(email, callback) {
    var request = new Uri(_authUrl+'user/send-email/forgot')
            .addQueryParam('email', email)
        , options = {
            method: "get",
            uri: request
        }
        , httpStatusToResultMap
        , result = 0;

    httpStatusToResultMap = {
        200 : Result.Success,
    }

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        callback(result, response.body);
    });
}

function changePassword(email, password, code, callback) {
    var request = new Uri(_authUrl+'user/change-password'),
        options = {
            method: "post",
            uri: request
        }
        , httpStatusToResultMap
        , result = 0;

    httpStatusToResultMap = {
        200 : Result.Success,
        400 : Result.InvalidUserNameOrPassword,
        429 : Result.CaptchaRequired,
        426 : Result.TemporaryLock,
    }

    options.post = JSON.stringify({
        email: email,
        password: password,
        code: code
    })

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        callback(result, response.body);
    });
}

function refreshToken(token, callback) {
    var request = new Uri(_authUrl+'token/refresh/' + token),
        options = {
            method: "get",
            uri: request
        }
        , httpStatusToResultMap
        , result = 0;


    httpStatusToResultMap = {
        200 : Result.Success,
        403 : Result.Error,
    }

    http.request(options, function(response) {
        if (httpStatusToResultMap.hasOwnProperty(response.status)) {
            result = httpStatusToResultMap[response.status];
        }

        _callAuthCallback(response.body, result, callback);
    });
}
