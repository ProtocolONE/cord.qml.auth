let TestCase = require('njsunit').TestCase;

let Auth = require('../build/Authorization.Test.js'),
    http = Auth.http,
    Uri = Auth.Uri;

class SetupTestCase extends TestCase {
    static testCaseTimeout() {
        return 30000;
    }

    setUp() {
        Auth.disableLog();
        Auth.setDefaultSettings();
    }

    testGetCaptchaImageSource () {
        let uri, query;
        Auth.setup({
            hwid: '',
            mid: '',
            authUrl: 'https://domen.com',
            authVersion: 'v2'
        })


        uri = new Auth.Uri(Auth.getCaptchaImageSource('username'));
        query = uri.query();
        this.assertNotNullOrUndefined(query.getParamValue('r'))
        query.deleteParam('r');
        uri.setQuery(query.toString());

        this.assertEqual('https://domen.com/api/v2/captcha/login/?email=username', uri.toString());
    }

    // testRequestParams (queue) {
    //     http.request({ method: 'post', uri: new Uri('https://gnapi.com/restapi/?method=wall.getNews&test=1')}, (responseObject) => {
    //         this.assertEqual(200, responseObject.status);
    //         this.assertNotUndefined(responseObject.header);
    //         this.assertNotUndefined(responseObject.body);
    //         queue();
    //     });
    // }
};

module.exports = SetupTestCase;
