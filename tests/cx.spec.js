var assert = require('assert'),
    cx = require("./../src/cx");


describe('Checkmarx', function () {
    describe('Get Authorization Header', function () {
        it('Get Authorization Header', async function () {
            try {
                var authorization = await cx.getOAuthToken();
                assert(true);
            } catch (e) {
                console.log(e.message);
                assert(false);
            }
        });
    });
    describe('Get Sizing Data', function () {
        it('Get Sizing Data', async function () {
            try {
                var data = await cx.getSizingData();
                assert(true);
            } catch (e) {
                console.log(e.message);
                assert(false);
            }
        });
    });
});