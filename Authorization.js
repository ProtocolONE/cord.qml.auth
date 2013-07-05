.pragma library

Qt.include('./Crypt.js');
Qt.include('./restapi.js');

//Replaced during CI build
var authVersion = "@VERSION"
    , _hwid
    , _mid;

function setup(options) {
    _hwid = options.hwid || '';
    _mid = options.mid || '';
}

function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

var Result = function() {};
Result.Success = 1;
Result.Cancel = 2;
Result.ServiceAccountBlocked = 3;
Result.WrongLoginOrPassword = 4;
Result.UnknownError = 5;
Result.Error = 6;

var ProviderBase = function() {
};

ProviderBase.prototype = {
    gnloginUri: 'https://gnlogin.ru',
    jsonCredentialCallback: function(response, callback) {
        var credential;

        if (response.status !== 200) {
            callback(Result.UnknownError);
            return;
        }

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
            switch (credential.response.error.code) {
            case Error.SERVICE_ACCOUNT_BLOCKED:
                callback(Result.ServiceAccountBlocked, credential.response.error);
                break;
            case Error.AUTHORIZATION_FAILED:
            case Error.INCORRECT_FORMAT_EMAIL:
                callback(Result.WrongLoginOrPassword, credential.response.error);
                break;
            default:
                callback(Result.UnknownError, credential.response.error);
                break;
            }

            return;
        }

        callback(Result.Success, credential.response);
    }
};

var ProviderRegister = function(mid, hwid) {
    this.mid = mid || _mid;
    this.hwid = hwid || _hwid;
};
extend(ProviderRegister, ProviderBase);

ProviderRegister.prototype.register = function(login, password, callback) {
    var self = this,
        request = new Uri(self.gnloginUri)
            .addQueryParam('json', '1')
            .addQueryParam('registration', '1')
            .addQueryParam('license', 'true')
            .addQueryParam('mid', self.mid)
            .addQueryParam('hwid', self.hwid)
            .addQueryParam('login', login)
            .addQueryParam('password', password);

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
};

var ProviderGuest = function(mid, hwid) {
    this.guestMid = mid || _mid;
    this.hwid = hwid || _hwid;
};
extend(ProviderGuest, ProviderBase);

ProviderGuest.prototype.login = function(gameId, callback) {
    var self = this,
        request = new Uri(self.gnloginUri).addQueryParam('guest', 'register');

    if (self.guestMid) {
        request.addQueryParam('mid', self.guestMid)
    }

    if (self.hwid) {
        request.addQueryParam('hwid', self.hwid)
    }

    if (gameId) {
        request.addQueryParam('gameId', gameId)
    }

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
};

ProviderGuest.prototype.confirm = function(userId, appKey, login, password, callback) {
    var self = this,
        request = new Uri(self.gnloginUri)
            .addQueryParam('guest', 'confirm')
            .addQueryParam('hwid', self.hwid)
            .addQueryParam('userId', userId)
            .addQueryParam('appKey', appKey)
            .addQueryParam('login', login)
            .addQueryParam('password', password);

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
};

var ProviderGameNet = function(hwid) {
    this.hwid = hwid || _hwid;
};
extend(ProviderGameNet, ProviderBase);

ProviderGameNet.prototype.login = function(login, password, callback) {
    var self = this,
        request = new Uri(self.gnloginUri)
            .addQueryParam('login', login)
            .addQueryParam('passhash', Sha1.hash(password))
            .addQueryParam('hwid', self.hwid)
            .addQueryParam('json', 1);

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
};

ProviderGameNet.prototype.loginByHash = function(login, hash, callback) {
    var self = this,
        request = new Uri(self.gnloginUri)
            .addQueryParam('login', login)
            .addQueryParam('passhash', hash)
            .addQueryParam('hwid', self.hwid)
            .addQueryParam('json', 1);

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
};

ProviderGameNet.prototype.refreshCookie = function(userId, appKey, callback) {
    var self = this,
        request = new Uri(self.gnloginUri)
            .addQueryParam('refreshCookie', '1')
            .addQueryParam('userId', userId)
            .addQueryParam('appKey', appKey);

    http.request(request, function(response) {
        self.jsonCredentialCallback(response, callback);
    });
}

var ProviderVk = function(parent) {
    this.appId = 2452628;
    this.redirectUrl = 'http://www.gamenet.ru/virality/auth';
    this.titleApiUrl = 'gnlogin.ru';
    this.parentObject = parent;
    this.browser = null;
    this.browserComponent = null;
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
        self.browser.webView.url = self.getUrl(self.redirectUrl + '?action=link');
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
        self.browser.webView.url = self.getUrl(self.redirectUrl + "?qGNA=1");
        self.browser.beforeClosed.connect(function() { callback(Result.Cancel); });
    });
};

ProviderVk.prototype.getUrl = function(redirectUrl) {
    var uri = new Uri()
        .setHost('http://api.vk.com')
        .setPath('/oauth/authorize')
        .addQueryParam('client_id', this.appId)
        .addQueryParam('response_type', 'code')
        .addQueryParam('scope', 'friends,offline')
        .addQueryParam('display', 'popup')
        .addQueryParam('redirect_uri', redirectUrl)

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

            switch (response.error.code) {
            case 102:
                callback(Result.ServiceAccountBlocked, response.error);
                break;
            case 100:
            case 110:
                callback(Result.WrongLoginOrPassword, response.error);
                break;
            default:
                callback(Result.UnknownError, response.error);
                break;
            }

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
