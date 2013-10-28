.pragma library

Qt.include('./Crypt.js');
Qt.include('./restapi.js');

//Replaced during CI build
var authVersion = "@VERSION"
    , _gnLoginUrl = 'https://gnlogin.ru'
    , _gnLoginTitleApiUrl = 'gnlogin.ru'
    , _hwid
    , _mid
    , _captcha;

var Result = function() {};
Result.Success = 1;
Result.Cancel = 2;
Result.ServiceAccountBlocked = 3;
Result.WrongLoginOrPassword = 4;
Result.UnknownError = 5;
Result.Error = 6;
Result.CaptchaRequired = 7;
Result.CodeRequired = 8;

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
}

/**
 * Set captcha text for next authorization attempt.
 */
function setCaptcha(value) {
    _captcha = value;
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
    var request = new Uri(_gnLoginUrl)
        .addQueryParam('refreshCookie', '1')
        .addQueryParam('userId', userId)
        .addQueryParam('appKey', appKey);

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
        .addQueryParam('password', password);

    http.request(request, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
}

/**
 * Login in gamenet by login and password.
 *
 * @param {string} login
 * @param {string} password
 * @param {function} callback
 */
function loginByGameNet(login, password, callback) {
    var request = new Uri(_gnLoginUrl)
        .addQueryParam('login', login)
        .addQueryParam('passhash', Sha1.hash(password))
        .addQueryParam('hwid', _hwid)
        .addQueryParam('json', 1);

    if (_captcha) {
        request.addQueryParam('captcha', _captcha);
    }

    http.request(request, function(response) {
        _captcha = '';
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

        return map[code] || map[0];
    },
    jsonCredentialCallback: function(response, callback) {
        var credential;

        if (response.status !== 200) {
            callback(Result.UnknownError);
            return;
        }

        _captcha = '';

        try {
            credential = JSON.parse(response.body);
        } catch (e) {
            callback(Result.UnknownError);
            return;
        }

        if (!credential.hasOwnProperty('response')) {
            callback(Result.UnknownError, credential);
            return;
        }

        if (credential.response.hasOwnProperty('error')) {
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
    var request = new Uri(self.gnloginUri)
        .addQueryParam('guest', 'confirm')
        .addQueryParam('hwid', _hwid)
        .addQueryParam('userId', userId)
        .addQueryParam('appKey', appKey)
        .addQueryParam('login', login)
        .addQueryParam('password', password);

    http.request(request, function(response) {
        _private.jsonCredentialCallback(response, callback);
    });
};

var ProviderVk = function(parent, hwid) {
    this.appId = 2452628;
    this.redirectUrl = _gnLoginUrl + '/social';
    this.titleApiUrl = _gnLoginTitleApiUrl;
    this.parentObject = parent;
    this.browser = null;
    this.browserComponent = null;
    this.hwid = hwid || _hwid;
};

ProviderVk.prototype.createBrowserComponent = function(callback) {
    if (this.browserComponent && this.browserComponent.status == Component.Ready) {
        callback();
        return;
    }

    var self = this;
    self.browserComponent = Qt.createComponent('./Authorization/Vk.qml');

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

ProviderVk.prototype.link = function(callback) {
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

        self.browser.webView.loadFailed.connect(function() { self.loadFailed(callback); });
        self.browser.webView.titleChanged.connect(function(title) { self.linkTitleChanged(title, callback); });
        self.browser.webView.urlChanged.connect(function(url) { self.urlChanged(url, callback); });
        self.browser.webView.url = self.getUrl('action=link');
        self.browser.beforeClosed.connect(function() { callback(Result.Cancel); });
    });
};

ProviderVk.prototype.login = function(callback) {
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

        self.browser.webView.loadFailed.connect(function() { self.loadFailed(callback); });
        self.browser.webView.titleChanged.connect(function(title) { self.loginTitleChanged(title, callback); });
        self.browser.webView.urlChanged.connect(function(url) { self.urlChanged(url, callback); });
        self.browser.webView.url = self.getUrl('qGNA=1');
        self.browser.beforeClosed.connect(function() { callback(Result.Cancel); });
    });
};

ProviderVk.prototype.getUrl = function(params) {
    var rp = this.redirectUrl + '?hwid=' + this.hwid + (params ? ('&' + params) : '')
        , uri;

    uri = new Uri()
        .setHost('http://oauth.vk.com')
        .setPath('/oauth/authorize')
        .addQueryParam('client_id', this.appId)
        .addQueryParam('response_type', 'code')
        .addQueryParam('scope', 'friends,offline')
        .addQueryParam('display', 'mobile')
        .addQueryParam('redirect_uri', rp);

    return uri.toString()
};

ProviderVk.prototype.loadFailed = function(callback) {
    this.browser.destroy();
    callback(Result.Cancel);
};

ProviderVk.prototype.loginTitleChanged = function(title, callback) {
    var titleUri = new Uri(title),
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

ProviderVk.prototype.linkTitleChanged = function(title, callback) {
    var titleUri = new Uri(title),
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

ProviderVk.prototype.urlChanged = function(url, callback) {
    var uri = new Uri(this.browser.webView.url);
    if (0 !== uri.host().indexOf('oauth.vk.com')) {
        return;
    }

    if ('1' === uri.getQueryParamValue('cancel') || uri.getQueryParamValue('logout')) {
        this.browser.destroy();
        callback(Result.Cancel);
    }
};
