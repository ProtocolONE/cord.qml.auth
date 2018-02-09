.pragma library

/*!
 * jsUri v@1.1.2
 * https://github.com/derek-watson/jsUri
 *
 * Copyright 2011, Derek Watson
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Includes parseUri regular expressions
 * http://blog.stevenlevithan.com/archives/parseuri
 * Copyright 2007, Steven Levithan
 * Released under the MIT license.
 *
 * Date: @DATE
 */

var Query = (function () {

    'use strict';

    /*jslint white:true, plusplus: true */

    function decode(s) {
        s = decodeURIComponent(s);
        s = s.replace('+', ' ');
        return s;
    }

    function Query(q) {
        var i, ps, p, kvp, k, v;

        this.params = [];

        if (typeof (q) === 'undefined' || q === null || q === '') {
            return;
        }

        if (q.indexOf('?') === 0) {
            q = q.substring(1);
        }

        ps = q.toString().split(/[&;]/);

        for (i = 0; i < ps.length; i++) {
            p = ps[i];
            kvp = p.split('=');
            k = kvp[0];
            v = p.indexOf('=') === -1 ? null : (kvp[1] === null ? '' : kvp[1]);
            this.params.push([k, v]);
        }
    }

    // getParamValues(key) returns the first query param value found for the key 'key'
    Query.prototype.getParamValue = function (key) {
        var param, i;
        for (i = 0; i < this.params.length; i++) {
            param = this.params[i];
            if (decode(key) === decode(param[0])) {
                return param[1];
            }
        }
    };

    // getParamValues(key) returns an array of query param values for the key 'key'
    Query.prototype.getParamValues = function (key) {
        var arr = [], i, param;
        for (i = 0; i < this.params.length; i++) {
            param = this.params[i];
            if (decode(key) === decode(param[0])) {
                arr.push(param[1]);
            }
        }
        return arr;
    };

    // deleteParam(key) removes all instances of parameters named (key)
    // deleteParam(key, val) removes all instances where the value matches (val)
    Query.prototype.deleteParam = function (key, val) {

        var arr = [], i, param, keyMatchesFilter, valMatchesFilter;

        for (i = 0; i < this.params.length; i++) {

            param = this.params[i];
            keyMatchesFilter = decode(param[0]) === decode(key);
            valMatchesFilter = decode(param[1]) === decode(val);

            if ((arguments.length === 1 && !keyMatchesFilter) ||
                (arguments.length === 2 && !keyMatchesFilter && !valMatchesFilter)) {
                arr.push(param);
            }
        }

        this.params = arr;

        return this;
    };

    // addParam(key, val) Adds an element to the end of the list of query parameters
    // addParam(key, val, index) adds the param at the specified position (index)
    Query.prototype.addParam = function (key, val, index) {

        if (arguments.length === 3 && index !== -1) {
            index = Math.min(index, this.params.length);
            this.params.splice(index, 0, [key, val]);
        } else if (arguments.length > 0) {
            this.params.push([key, val]);
        }
        return this;
    };

    // replaceParam(key, newVal) deletes all instances of params named (key) and replaces them with the new single value
    // replaceParam(key, newVal, oldVal) deletes only instances of params named (key) with the value (val) and replaces them with the new single value
    // this function attempts to preserve query param ordering
    Query.prototype.replaceParam = function (key, newVal, oldVal) {

        var index = -1, i, param;

        if (arguments.length === 3) {
            for (i = 0; i < this.params.length; i++) {
                param = this.params[i];
                if (decode(param[0]) === decode(key) && decodeURIComponent(param[1]) === decode(oldVal)) {
                    index = i;
                    break;
                }
            }
            this.deleteParam(key, oldVal).addParam(key, newVal, index);
        } else {
            for (i = 0; i < this.params.length; i++) {
                param = this.params[i];
                if (decode(param[0]) === decode(key)) {
                    index = i;
                    break;
                }
            }
            this.deleteParam(key);
            this.addParam(key, newVal, index);
        }
        return this;
    };

    Query.prototype.toString = function () {
        var s = '', i, param;
        for (i = 0; i < this.params.length; i++) {
            param = this.params[i];
            if (s.length > 0) {
                s += '&';
            }
            if (param[1] === null) {
                s += param[0];
            }
            else {
                s += param.join('=');
            }
        }
        return s.length > 0 ? '?' + s : s;
    };

    return Query;
}());

var Uri = (function () {

    'use strict';

    /*jslint white: true, plusplus: true, regexp: true, indent: 2 */
    /*global Query: true */

    function is(s) {
        return (s !== null && s !== '');
    }

    function Uri(uriStr) {

        uriStr = uriStr || '';

        var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
            keys = [
                "source",
                "protocol",
                "authority",
                "userInfo",
                "user",
                "password",
                "host",
                "port",
                "relative",
                "path",
                "directory",
                "file",
                "query",
                "anchor"
            ],
            q = {
                name: 'queryKey',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            m = parser.exec(uriStr),
            i = 14,
            self = this;

        this.uriParts = {};

        while (i--) {
            this.uriParts[keys[i]] = m[i] || "";
        }

        this.uriParts[q.name] = {};
        this.uriParts[keys[12]].replace(q.parser, function ($0, $1, $2) {
            if ($1) {
                self.uriParts[q.name][$1] = $2;
            }
        });

        this.queryObj = new Query(this.uriParts.query);

        this.hasAuthorityPrefixUserPref = null;
    }


    /*
     Basic get/set functions for all properties
     */

    Uri.prototype.protocol = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.protocol = val;
        }
        return this.uriParts.protocol;
    };

    // hasAuthorityPrefix: if there is no protocol, the leading // can be enabled or disabled
    Uri.prototype.hasAuthorityPrefix = function (val) {

        if (typeof val !== 'undefined') {
            this.hasAuthorityPrefixUserPref = val;
        }

        if (this.hasAuthorityPrefixUserPref === null) {
            return (this.uriParts.source.indexOf('//') !== -1);
        } else {
            return this.hasAuthorityPrefixUserPref;
        }
    };

    Uri.prototype.userInfo = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.userInfo = val;
        }
        return this.uriParts.userInfo;
    };

    Uri.prototype.host = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.host = val;
        }
        return this.uriParts.host;
    };

    Uri.prototype.port = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.port = val;
        }
        return this.uriParts.port;
    };

    Uri.prototype.path = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.path = val;
        }
        return this.uriParts.path;
    };

    Uri.prototype.query = function (val) {
        if (typeof val !== 'undefined') {
            this.queryObj = new Query(val);
        }
        return this.queryObj;
    };

    Uri.prototype.anchor = function (val) {
        if (typeof val !== 'undefined') {
            this.uriParts.anchor = val;
        }
        return this.uriParts.anchor;
    };

    /*
     Fluent setters for Uri properties
     */
    Uri.prototype.setProtocol = function (val) {
        this.protocol(val);
        return this;
    };

    Uri.prototype.setHasAuthorityPrefix = function (val) {
        this.hasAuthorityPrefix(val);
        return this;
    };

    Uri.prototype.setUserInfo = function (val) {
        this.userInfo(val);
        return this;
    };

    Uri.prototype.setHost = function (val) {
        this.host(val);
        return this;
    };

    Uri.prototype.setPort = function (val) {
        this.port(val);
        return this;
    };

    Uri.prototype.setPath = function (val) {
        this.path(val);
        return this;
    };

    Uri.prototype.setQuery = function (val) {
        this.query(val);
        return this;
    };

    Uri.prototype.setAnchor = function (val) {
        this.anchor(val);
        return this;
    };


    /*
     Query method wrappers
     */
    Uri.prototype.getQueryParamValue = function (key) {
        return this.query().getParamValue(key);
    };

    Uri.prototype.getQueryParamValues = function (key) {
        return this.query().getParamValues(key);
    };

    Uri.prototype.deleteQueryParam = function (key, val) {
        if (arguments.length === 2) {
            this.query().deleteParam(key, val);
        } else {
            this.query().deleteParam(key);
        }

        return this;
    };

    Uri.prototype.addQueryParam = function (key, val, index) {
        if (arguments.length === 3) {
            this.query().addParam(key, val, index);
        } else {
            this.query().addParam(key, val);
        }
        return this;
    };

    Uri.prototype.replaceQueryParam = function (key, newVal, oldVal) {
        if (arguments.length === 3) {
            this.query().replaceParam(key, newVal, oldVal);
        } else {
            this.query().replaceParam(key, newVal);
        }

        return this;
    };


    /*
     Serialization
     */
    Uri.prototype.scheme = function () {

        var s = '';

        if (is(this.protocol())) {
            s += this.protocol();
            if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
                s += ':';
            }
            s += '//';
        } else {
            if (this.hasAuthorityPrefix() && is(this.host())) {
                s += '//';
            }
        }

        return s;
    };

    /*
     Same as Mozilla nsIURI.prePath
     cf. https://developer.mozilla.org/en/nsIURI
     */
    Uri.prototype.origin = function () {

        var s = this.scheme();

        if (is(this.userInfo()) && is(this.host())) {
            s += this.userInfo();
            if (this.userInfo().indexOf('@') !== this.userInfo().length - 1) {
                s += '@';
            }
        }

        if (is(this.host())) {
            s += this.host();
            if (is(this.port())) {
                s += ':' + this.port();
            }
        }

        return s;
    };


    // toString() stringifies the current state of the uri
    Uri.prototype.toString = function () {

        var s = this.origin();

        if (is(this.path())) {
            s += this.path();
        } else {
            if (is(this.host()) && (is(this.query().toString()) || is(this.anchor()))) {
                s += '/';
            }
        }
        if (is(this.query().toString())) {
            if (this.query().toString().indexOf('?') !== 0) {
                s += '?';
            }
            s += this.query().toString();
        }

        if (is(this.anchor())) {
            if (this.anchor().indexOf('#') !== 0) {
                s += '#';
            }
            s += this.anchor();
        }

        return s;
    };

    /*
     Cloning
     */
    Uri.prototype.clone = function () {
        return new Uri(this.toString());
    };

    return Uri;
}());

var Error = function() {
};

//UNDONE Это не весь перечень ошибок. При необходимости - добавляйте.
Error.UNKNOWN = 1;
Error.TO_MANY_REQUESTS = 2;
Error.INVALID_REQUEST = 3;
Error.CAPTCHA_REQUIRED = 11;
Error.AUTHORIZATION_FAILED = 100;
Error.ACCOUNT_NOT_EXISTS = 101;
Error.SERVICE_ACCOUNT_BLOCKED = 102;
Error.AUTHORIZATION_LIMIT_EXCEED = 103;
Error.UNKNOWN_ACCOUNT_STATUS = 104;
Error.INCORRECT_ACCOUNT_PASSWORD = 105;
Error.INCORRECT_FORMAT_EMAIL = 110;
Error.NICKNAME_FORMAT_INCORRECT = 114;
Error.NICKNAME_EXISTS = 115;
Error.TECHNAME_FORMAT_INCORRECT = 116;
Error.TECHNAME_EXISTS = 117;
Error.UNABLE_CHANGE_TECHNAME = 118;
Error.UNABLE_CHANGE_NICKNAME = 119;
Error.NICKNAME_NOT_SPECIFIED = 121;
Error.TECHNAME_NOT_SPECIFIED = 122;
Error.NICKNAME_FORBIDDEN = 123;
Error.TECHNAME_FORBIDDEN = 124;
Error.SERVICE_AUTHORIZATION_IMPOSSIBLE = 125;
Error.INCORRECT_SMS_CODE = 126;
Error.PHONE_ALREADY_IN_USE = 127;
Error.UNABLE_DELIVER_SMS = 128;
Error.INVALID_PHONE_FORMAT = 129;
Error.PHONE_BLOCKED = 130;
Error.TFA_SMS_TIMEOUT_IS_NOT_EXPIRED = 136;
Error.TFA_NEED_SMS_CODE = 137;
Error.TFA_NEED_APP_CODE = 138;
Error.TFA_INVALID_CODE = 139;
Error.PARAMETER_MISSING = 200;
Error.WRONG_AUTHTYPE = 201;
Error.WRONG_SERVICEID = 202;
Error.WORNG_AUTHID = 203;
Error.UNKNOWN_METHOD = 204;
Error.PAKKANEN_PERMISSION_DENIED = 601;
Error.PAKKANEN_VK_LINK = 602;
Error.PAKKANEN_PHONE_VERIFICATION = 603;
Error.PAKKANEN_VK_LINK_AND_PHONE_VERIFICATION = 604;

var http = function() {
};

// INFO debug output
http.logRequest = false;

http.request = function(options, callback) {
    var xhr = new XMLHttpRequest(),
        method = options.method || 'get',
        uri,
        userAgent;

    if (options instanceof Uri) {
        uri = options;
    } else if (typeof options === 'string') {
        uri =  new Uri(options);
    } else if (options.hasOwnProperty('uri') && options.uri instanceof Uri) {
        uri = options.uri;
        if (options.hasOwnProperty('userAgent')) {
            userAgent = options.userAgent;
        }
    } else {

        throw new Exception('Wrong options');
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { // full body received
            return;
        }

        if (http.logRequest) {
            // INFO debug output
            var tmp = '[Auth]Request: ' + uri.toString();
            try {
                var debugResponseObject = JSON.parse(xhr.responseText);
                tmp += '\n[Auth]Response: \n' + JSON.stringify(debugResponseObject, null, 2)
            } catch(e) {
                tmp += '\n[Auth]Response: \n' + xhr.responseText
            }
            console.log(tmp);
        }
        callback({status: xhr.status, header: xhr.getAllResponseHeaders(), body: xhr.responseText});
    };

    if (method === 'get') {
        xhr.open('GET', uri.toString());

        if (userAgent) {
            xhr.setRequestHeader('QtBug', 'QTBUG-20473\r\nUser-Agent: ' + userAgent);
        }

        xhr.send(null);
    } else {
        xhr.open('POST', uri.protocol() + '://' + uri.host()  + uri.path());

        if (userAgent) {
            xhr.setRequestHeader('QtBug', 'QTBUG-20473\r\nUser-Agent: ' + userAgent);
        }

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(uri.query().toString().substring(1)); //jsuri return query with '?' always
    }
}

//Replaced during CI build
var authVersion = "@VERSION"
    , _gnLoginUrl = 'https://gnlogin.ru'
    , _gnLoginTitleApiUrl = 'gnlogin.ru'
    , _apiUrl = 'https://gnapi.com:8443/restapi'
    , _hwid
    , _mid
    , _captcha
    , _code2fa = "";

var Result = function() {};
Result.Success = 1;
Result.Cancel = 2;
Result.ServiceAccountBlocked = 3;
Result.WrongLoginOrPassword = 4;
Result.UnknownError = 5;
Result.Error = 6;
Result.CaptchaRequired = 7;
Result.CodeRequired = 8;
Result.SecuritySMSCodeRequired = 9;
Result.SecurityAppCodeRequired = 10;
Result.SecurityCodeInvalid = 11;
Result.SecurityCodeTimeoutIsNotExpired = 12;

/**
 * Setup package params - hwid, mid, gnLoginUrl and titleApiUrl.
 *
 * @param options
 */
function setup(options) {
    _hwid = options.hwid || '';
    _mid = options.mid || '';
    _gnLoginUrl = options.gnLoginUrl || _gnLoginUrl;
    _gnLoginTitleApiUrl = options.titleApiUrl || _gnLoginTitleApiUrl;
    _apiUrl = options.apiUrl || _apiUrl;

    if (options.debug) {
        http.logRequest = true
    }
}

/**
 * Set captcha text for next authorization attempt.
 */
function setCaptcha(value) {
    _captcha = value;
}

/**
 * Set captcha text for next authorization attempt.
 */
function setCode2fa(value) {
    _code2fa = value;
}

/**
 * Get url captcha image for given login.
 */
function getCaptchaImageSource(login) {
    var url = new Uri(_gnLoginUrl)
        .addQueryParam('captcha', 1)
        .addQueryParam('type', 'login')
        .addQueryParam('r', Math.random())
        .addQueryParam('login', login);

    return url.toString();
}

/**
 * Send unblock code to user.
 *
 * @param {string} login GameNet login
 * @param {string} method Should me `email` or `sms`
 * @param {function} callback
 */
function sendUnblockCode(login, method, callback) {
    var url = new Uri(_gnLoginUrl)
        .setPath('/sendCode')
        .addQueryParam('login', login)
        .addQueryParam('method', method);

    http.request(url, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Generate new cookie string by given userId and appKey.
 */
function refreshCookie(userId, appKey, callback) {
    var request = new Uri(_gnLoginUrl + '/internals/refreshCookie/')
        .addQueryParam('refreshCookie', '1')
        .addQueryParam('userId', userId)
        .addQueryParam('appKey', Qt.md5(appKey + 'EqVGL86ahyzADHEextuEFqHJ'));

    http.request(request, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Unblock user account with given code.
 */
function unblock(login, code, callback) {
    var url = new Uri(_gnLoginUrl)
        .setPath('/unblock')
        .addQueryParam('login', login)
        .addQueryParam('code', code);

    http.request(url, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Register new gamenet user.
 *
 * @param {string} login
 * @param {string} password
 * @param {function} callback
 */
function register(login, password, callback) {
    var request = new Uri(_gnLoginUrl)
        .addQueryParam('json', '1')
        .addQueryParam('registration', '1')
        .addQueryParam('license', 'true')
        .addQueryParam('mid', _mid)
        .addQueryParam('hwid', _hwid)
        .addQueryParam('login', login)
        .addQueryParam('password', encodeURIComponent(password));

    var options = {
        method: "post",
        uri: request
    };
    http.request(options, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Login in gamenet by login and password.
 *
 * @param {string} login
 * @param {string} password
 * @param {bool} remember
 * @param {function} callback
 */
function loginByGameNet(login, password, remember, callback) {
    var request = new Uri(_gnLoginUrl)
        .addQueryParam('login', login)
        .addQueryParam('passhash', encodeURIComponent(password))
        .addQueryParam('hwid', _hwid)
        .addQueryParam('new', 1)
        .addQueryParam('json', 1)
        .addQueryParam('trustedLocation', remember ? 1 : 0);

    if (_captcha) {
        request.addQueryParam('captcha', _captcha);
    }

    if (_code2fa) {
        request.addQueryParam('code2fa', _code2fa);
    }

    var options = {
        method: "post",
        uri: request
    };

    http.request(options, function(response) {
        _captcha = '';
        _code2fa = '';
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Request security SMS code.
 *
 * @param {string} login
 * @param {function} callback
 */
function requestSMSCode(login, callback) {
    var request = new Uri(_apiUrl)
        .addQueryParam('method', 'user.send2FaKeyViaSms')
        .addQueryParam('login', login)
        .addQueryParam('format', 'json');

    var options = {
        method: "post",
        uri: request
    };

    http.request(options, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Login in gamenet by VK.
 *
 * @param {QMLObject} parent
 * @param {function} callback
 */
function loginByVk(parent, callback) {
    var auth = new ProviderVk(parent);
    auth.login(callback);
}

/**
 * Link gamenet account with VK.
 *
 * @param {QMLObject} parent
 * @param {function} callback
 */
function linkVkAccount(parent, callback) {
    var auth = new ProviderVk(parent);
    auth.link(callback);
}

function loginByOk(parent, callback) {
    var auth = new ProviderOk(parent);
    auth.login(callback);
}

function linkOkAccount(parent, callback) {
    var auth = new ProviderOk(parent);
    auth.link(callback);
}

function loginByFb(parent, callback) {
    var auth = new ProviderFb(parent);
    auth.login(callback);
}

function linkFbAccount(parent, callback) {
    var auth = new ProviderFb(parent);
    auth.link(callback);
}

/**
 * Return True is given code is success code.
 *
 * @return bool
 */
function isSuccess(code) {
    return Result.Success === code;
}
var _private = {
    remapErrorCode: function(code) {
        var map = {};
        map[0] = Result.UnknownError;
        map[Error.CAPTCHA_REQUIRED] = Result.CaptchaRequired;
        map[Error.AUTHORIZATION_LIMIT_EXCEED] = Result.CodeRequired;
        map[Error.SERVICE_ACCOUNT_BLOCKED] = Result.ServiceAccountBlocked;
        map[Error.AUTHORIZATION_FAILED] = Result.WrongLoginOrPassword;
        map[Error.INCORRECT_FORMAT_EMAIL] = Result.WrongLoginOrPassword;
        map[Error.TFA_SMS_TIMEOUT_IS_NOT_EXPIRED] = Result.SecurityCodeTimeoutIsNotExpired;
        map[Error.TFA_NEED_SMS_CODE] = Result.SecuritySMSCodeRequired;
        map[Error.TFA_NEED_APP_CODE] = Result.SecurityAppCodeRequired;
        map[Error.TFA_INVALID_CODE] = Result.SecurityCodeInvalid;

        return map[code] || map[0];
    },
    jsonCredentialCallback: function(response, callback) {
        var credential;

        if (response.status !== 200) {
            console.log('Auth error. Response status: ', response.status);
            callback(Result.UnknownError);
            return;
        }

        _captcha = '';
        _code2fa = '';

        try {
            credential = JSON.parse(response.body);
        } catch (e) {
            console.log('Auth error. Json parse failed. Bad response: ', response.body);
            callback(Result.UnknownError);
            return;
        }

        if (!credential.hasOwnProperty('response')) {
            console.log('Auth error. Response is empty. Bad response: ', response.body);
            callback(Result.UnknownError, credential);
            return;
        }

        if (credential.response.hasOwnProperty('error')) {
            console.log('Auth error. Response has error. Bad response: ', response.body);
            callback(_private.remapErrorCode(credential.response.error.code), credential.response.error);
            return;
        }

        callback(Result.Success, credential.response);
    },
    extend: function(Child, Parent) {
        var F = function() {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    }
}

var ProviderGuest = function() {
};

ProviderGuest.prototype.login = function(gameId, callback) {
    var request = new Uri(_gnLoginUrl).addQueryParam('guest', 'register');

    if (_mid) {
        request.addQueryParam('mid', _mid)
    }

    if (_hwid) {
        request.addQueryParam('hwid', _hwid)
    }

    if (gameId) {
        request.addQueryParam('gameId', gameId)
    }

    http.request(request, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
};

ProviderGuest.prototype.confirm = function(userId, appKey, login, password, callback) {
    var request = new Uri(_gnLoginUrl)
        .addQueryParam('guest', 'confirm')
        .addQueryParam('hwid', _hwid)
        .addQueryParam('userId', userId)
        .addQueryParam('appKey', appKey)
        .addQueryParam('login', login)
        .addQueryParam('password', encodeURIComponent(password));

    var options = {
        method: "post",
        uri: request
    };
    
    http.request(options, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
};

var ProviderOAuth = function(parent, hwid) {
    this.appId = "Unknown";
    this.networkId = "Unknown";
    this.scope = "Unknown";
    this.authHost = "Unknown";
    this.authProtocol = "https";
    this.authPath = "/oauth/authorize";
    this.displayParams = "mobile";

    this.redirectUrl = _gnLoginUrl + '/oauth';
    this.titleApiUrl = _gnLoginTitleApiUrl;
    this.parentObject = parent;
    this.browser = null;
    this.browserComponent = null;
    this.hwid = hwid || _hwid;
    this.hwid64 = Qt.btoa(this.hwid);
}

ProviderOAuth.prototype.createBrowserComponent = function(callback) {
    if (this.browserComponent && this.browserComponent.status == Component.Ready) {
        callback();
        return;
    }

    var self = this;
    self.browserComponent = Qt.createComponent('./Vk.qml');

    function finishCreation() {
        // I really don't know why Component unavailable here, so
        // Component.Ready = 1 Component.Error = 3
        if (self.browserComponent.status == 1) {
            callback();
        } else if (self.browserComponent.status == 3) {
            // Error Handling
            console.log("Error loading component:", self.browserComponent.errorString());
            callback('error');
        }
    }

    if (self.browserComponent.status == 1) {
        finishCreation();
    } else if (self.browserComponent.status == 3) {
        // Error Handling
        console.log("Error loading component:", self.browserComponent.errorString());
        callback('error');
    } else {
        self.browserComponent.statusChanged.connect(finishCreation);
    }
};

ProviderOAuth.prototype.link = function(callback) {
    var self = this;

    if (typeof callback !== 'function') {
        throw new Exception('Callback must be provided');
    }

    this.createBrowserComponent(function(error) {
        if (error) {
            callback(Result.UnknownError);
            return;
        }

        self.browser = self.browserComponent.createObject(self.parentObject);
        if (!self.browser) {
            console.log("can't create browser");
            callback(Result.UnknownError);
            return;
        }

        self.browser.webView.loadFailedFixed.connect(function() { self.loadFailed(callback); });
        self.browser.webView.titleChanged.connect(function(title) { self.linkTitleChanged(title, callback); });
        self.browser.webView.urlChanged.connect(function(url) { self.urlChanged(url, callback); });
        self.browser.webView.url = self.getUrl('action=link');
        self.browser.closing.connect(function() { callback(Result.Cancel); });
    });
};

ProviderOAuth.prototype.login = function(callback) {
    var self = this;
    if (typeof callback !== 'function') {
        throw new Exception('Callback must be provided');
    }

    this.createBrowserComponent(function(error) {
        if (error) {
            callback(Result.UnknownError);
            return;
        }

        self.browser = self.browserComponent.createObject(self.parentObject);
        if (!self.browser) {
            console.log("can't create browser");
            callback(Result.UnknownError);
            return;
        }

        self.browser.webView.loadFailedFixed.connect(function() { self.loadFailed(callback); });
        self.browser.webView.titleChanged.connect(function(title) { self.loginTitleChanged(title, callback); });
        self.browser.webView.urlChanged.connect(function(url) { self.urlChanged(url, callback); });
        self.browser.webView.url = self.getUrl();
        self.browser.closing.connect(function() { callback(Result.Cancel); });
    });
};

ProviderOAuth.prototype.getUrl = function(params) {
    var rp, uri;
    rp = new Uri(this.redirectUrl)
        .addQueryParam("network", this.networkId)
        .addQueryParam("hwid64", encodeURIComponent(this.hwid64))
        .toString();

    if (!!params) {
        rp = rp + ('&' + params);
    }

    uri = new Uri()
        .setProtocol(this.authProtocol)
        .setHost(this.authHost)
        .setPath(this.authPath)
        .addQueryParam('client_id', this.appId)
        .addQueryParam('response_type', 'code')
        .addQueryParam('scope', this.scope)
        .addQueryParam('display', this.displayParams)
        .addQueryParam('redirect_uri', encodeURIComponent(rp));

    return uri.toString();
};

ProviderOAuth.prototype.loadFailed = function(callback) {
    this.browser.destroy();
    callback(Result.Cancel);
};

ProviderOAuth.prototype.loginTitleChanged = function(title, callback) {
    var titleUri = new Uri(this.browser.webView.title),
        currentUri, userId, appKey, cookie;

    if (0 !== titleUri.host().indexOf(this.titleApiUrl)) {
        return;
    }

    currentUri = new Uri(this.browser.webView.url);

    if ('access_denied' === currentUri.getQueryParamValue('error')) {
        this.browser.destroy();
        callback(Result.Cancel);
        return;
    }

    if ('1' === titleUri.getQueryParamValue('isBlocked')) {
        this.browser.destroy();
        callback(Result.ServiceAccountBlocked);
        return;
    }

    if (!this.browser.webView.isLoaded) {
        return;
    }

    userId = titleUri.getQueryParamValue('userId');
    appKey = titleUri.getQueryParamValue('appKey');
    cookie = titleUri.getQueryParamValue('ga');

    if (!userId || !appKey || !cookie) {
        this.browser.destroy();
        callback(Result.Cancel);
        return;
    }

    this.browser.destroy();
    callback(Result.Success, { userId: userId, appKey: appKey, cookie: cookie });
};

ProviderOAuth.prototype.linkTitleChanged = function(title, callback) {
    var titleUri = new Uri(this.browser.webView.title),
        currentUri, code;

    if (0 !== titleUri.host().indexOf(this.titleApiUrl)) {
        return;
    }

    currentUri = new Uri(this.browser.webView.url);
    if ('access_denied' === currentUri.getQueryParamValue('error')) {
        this.browser.destroy();
        callback(Result.Cancel);
        return;
    }

    if (!this.browser.webView.isLoaded) {
        return;
    }

    code = titleUri.getQueryParamValue('code');
    if ('' === code) {
        this.browser.destroy();
        callback(Result.Cancel);
        return;
    }

    var self = this;
    this.browser.link(code, self.redirectUrl + '?action=link', function(isSuccess, response) {
        if (response.hasOwnProperty('error')) {
            self.browser.destroy();
            callback(_private.remapErrorCode(response.error.code), response.error);
            return;
        }

        if (false === isSuccess) {
            self.browser.destroy();
            callback(Result.UnknownError);
            return;
        }

        if (response.result === 'error') {
            self.browser.destroy();
            callback(Result.Error, response.message);
            return;
        }

        self.browser.destroy();
        callback(Result.Success);
    });
};

ProviderOAuth.prototype.urlChanged = function(url, callback) {
    var uri = new Uri(this.browser.webView.url);
    if (0 !== uri.host().indexOf(this.authHost)) {
        return;
    }

    if ('1' === uri.getQueryParamValue('cancel') || uri.getQueryParamValue('logout')) {
        this.browser.destroy();
        callback(Result.Cancel);
    }
};

var ProviderVk = function(parent, hwid) {
    ProviderVk.superclass.constructor.apply(this, arguments);

    this.appId = 2452628;
    this.networkId = "vk";
    this.scope = "friends,offline,email";
    this.authHost = "oauth.vk.com";
    this.authProtocol = "https";
}
_private.extend(ProviderVk, ProviderOAuth);

var ProviderOk = function(parent, hwid) {
    ProviderOk.superclass.constructor.apply(this, arguments);

    this.appId = 1248179200;
    this.networkId = "ok";
    this.scope = "valuable_access,get_email";
    this.authHost = "connect.ok.ru";
    this.authProtocol = "https";
}
_private.extend(ProviderOk, ProviderOAuth);

var ProviderFb = function(parent, hwid) {
    ProviderFb.superclass.constructor.apply(this, arguments);

    this.appId = "580128682172889";
    this.networkId = "fb";
    this.scope = "public_profile,email,user_birthday,user_location,user_friends";
    this.authHost = "www.facebook.com";
    this.authProtocol = "https";
    this.authPath = "/v2.8/dialog/oauth";
    this.displayParams = 'popup';
}
_private.extend(ProviderFb, ProviderOAuth);
