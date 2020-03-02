var assert = require('assert'),
    time = require("./../src/time");

describe('Time', function () {
    describe('Get Duration', function () {
        it('No Parameter', function () {
            var duration = time.getDuration();
            assert(!duration);
        });
        it('No 2nd Parameter', function () {
            var duration = time.getDuration("test");
            assert(!duration);
        });
        it('No 1st Parameter', function () {
            var duration = time.getDuration(null, "test");
            assert(!duration);
        });
        it('Invalid Date', function () {
            var duration = time.getDuration("test", "test");
            assert(!duration);
        });
    });
    
    describe('Is Valid Date', function () {
        it('No Parameter', function () {
            assert(!time.isValidDate());
        });
        it('Invalid Date', function () {
            assert(!time.isValidDate("test"));
        });
        it('Valid Date', function () {
            assert(time.isValidDate("10/02/2019"));
        });
    });
});