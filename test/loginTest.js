let TestCase = require('njsunit').TestCase;

let Auth = require('../build/Authorization.Test.js'),
    http = Auth.http,
    Uri = Auth.Uri;

class LoginTestCase extends TestCase {
    static testCaseTimeout() {
        return 10000;
    }

    setUp() {
        Auth.disableLog();
        Auth.setDefaultSettings();
    }


    testLoginUser (queue) {
        // UNDONE test errors InvalidUserNameOrPassword
        Auth.enableLog();
        Auth.login('a1@a.com', '123456',  'a1s2', (result, response) => {
            this.assertEqual(Auth.Result.Success, result);
            queue();
        });
    }

    // INFO Can't be tested by CI.
    // testRequestCode (queue) {
    //     Auth.enableLog();
    //     Auth.requestPasswordResetCode('a1@a.com', (result, response) => {
    //         this.assertEqual(Auth.Result.Success, result);
    //         queue();
    //     });
    // }

    testChangePassword (queue) {
        Auth.enableLog();
        Auth.changePassword('a1@a.com', '123456',  'a1s2', (result, response) => {
            this.assertEqual(Auth.Result.Success, result);
            queue();
        });
    }
};

module.exports = LoginTestCase;
