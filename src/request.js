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
        uri = new Uri(options);
    } else if (options.hasOwnProperty('uri') && options.uri instanceof Uri) {
        uri = options.uri;
        if (options.hasOwnProperty('userAgent')) {
            userAgent = options.userAgent;
        }
    } else {

        throw new Exception('Wrong options');
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) { // full body received
            return;
        }

        if (http.logRequest) {
            // INFO debug output
            var tmp = 'Request: ' + uri.toString();
            tmp += '\nStatus: ' + xhr.status;
            try {
                var debugResponseObject = JSON.parse(xhr.responseText);
                tmp += '\nResponse: \n' + JSON.stringify(debugResponseObject, null, 2);
            } catch (e) {
                tmp += '\nResponse: \n' + xhr.responseText;
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
        xhr.open('POST', uri.protocol() + '://' + uri.host() + uri.path());

        if (userAgent) {
            xhr.setRequestHeader('QtBug', 'QTBUG-20473\r\nUser-Agent: ' + userAgent);
        }

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if (options.hasOwnProperty('post')) {
            xhr.send(options.post); //jsuri return query with '?' always
        } else {
            xhr.send(uri.query().toString().substring(1)); //jsuri return query with '?' always
        }
    }
};

