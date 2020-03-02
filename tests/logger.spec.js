var assert = require('assert'),
    logger = require("./../src/logger");

describe('Logger', function () {
    it('No Parameter', function () {
        var log = logger.getLogger();
        if (log) {
            log.debug("test");
            assert(true);
        } else {
            assert(false);
        }
    });
    it('No Logger Name', function () {
        var log = logger.getLogger(null);
        if (log) {
            log.debug("test");
            assert(true);
        } else {
            assert(false);
        }
    });
    it('With Logger Name', function () {
        var log = logger.getLogger("test");
        if (log) {
            log.debug("test");
            assert(true);
        } else {
            assert(false);
        }
    });
});