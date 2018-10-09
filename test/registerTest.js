let TestCase = require('njsunit').TestCase;

let Auth = require('../build/Authorization.Test.js'),
    http = Auth.http,
    Uri = Auth.Uri;

class RegisterTestCase extends TestCase {
    static testCaseTimeout() {
        return 10000;
    }

    setUp() {
        Auth.disableLog();
        Auth.setDefaultSettings();
    }

    // INFO Can't be tested by CI.
    testRegisterUser (queue) {
        let uri, query;

        // UNDONE test errors InvalidUserNameOrPassword
        Auth.enableLog();
        Auth.registerUser('a1@a.com', '123456', (result, response) => {
            this.assertEqual(Auth.Result.InvalidUserNameOrPassword, result);
            queue();
        });
    }
};

module.exports = RegisterTestCase;
