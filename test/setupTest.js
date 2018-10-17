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

    testDcodeJwt() {
        var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1MzkxNTM0MTEsImV4cCI6MTUzOTE1NTIxMSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlkIjoiNWJiZDlkZTMzNDg5ZDI5YzgzMGZkYjBkIn0.SKoEfLk7b4GshpXWXobtQeF00XVjWh1vQDe41hWVtcHGf_qSEG3WqcRFsgRdWsJ1vBTBSHjmoSupxSdNyHY6lP04wlnaFwr7w5ofBVeNPaP78bX6qnXvmBpfrvRzLX2IQBJLw89CAqfiCDJgTZzJ9Gu9K8VwygjwdtjqEhq3ugEbaBslO_dHQ-6rXwk5CnjsSTsTleyTERCIathB_Zl4L0UUXHgjXZ3gE_4CdTmuCnHjFOjdGmLtd1v80ZXWyuQifbwL32QPV4FniRXCrI7zEEXcBJAlGwF0gPYeOht3G2wgpYw4rD0dADYEX1J5gtAnKujxdULdvR1S6Xnq0Rt9rKAkC0OC2Gz9RjWfY92Kw-NPDeFlXHBEaIm0Q6XOvX9ctRSb5S7K4_FbPFTlIBQnlzipWt7pXUH6ObSJw0y_ZsmBfvbL0nCgqyZzKCAYOo2T88gjhbdl7hivICjcVNWD6R1cU5llwEC85t2AyqLpZPDdgpuevwDjXOwCDJLylrYxTK5oL_bi-2fKLzxRqNNhAYQ3Hs4CpAMML1PqmcxKXApN8U7d1jxgteL8l0XIEK47ZjoyD2kXL9fHCK0HmDeY5GWv1yRpVPExLxATcQiHyTZJQ51vdnWxn1zx9bVU8ZUCuJgGwbZYB1oVSXNWH7t5y_2Bh6_dfmxeg3ITUWZ0kCI';
        var data = Auth.decodeJwt(jwt);

        this.assertEqual('5bbd9de33489d29c830fdb0d', data.payload.id);
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
