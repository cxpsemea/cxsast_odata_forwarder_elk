var assert = require('assert'),
    es = require("./../src/es"),
    indexTestName = "test",
    testArray = [{
        test: "test"
    }];

var deleteIndex = async function () {
        try {
            await es.deleteIndex(indexTestName);
        } catch (e) {

        }
    },
    createIndex = async function () {
        try {
            await es.createIndex(indexTestName);
        } catch (e) {

        }
    };

describe('Elastic Search', function () {
    describe('Get Hash', function () {
        it('Get Hash', async function () {
            try {
                var hash = es.getHash(indexTestName);
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Get ES Index', function () {
        it('Get ES Index', async function () {
            try {
                var index = es.getESIndex();
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Ping', function () {
        it('Ping', async function () {
            try {
                var ping = await es.ping();
                assert(ping == true);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Create Index', function () {
        it('No Parameter - Fail', async function () {
            try {
                await es.createIndex();
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Empty Parameter - Fail', async function () {
            try {
                await es.createIndex("");
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Create Index - Success', async function () {
            await deleteIndex();
            try {
                var index = await es.createIndex(indexTestName);
                assert(index.index == indexTestName);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
        it('Create Existing Index - Fail', async function () {
            await createIndex();
            try {
                await es.createIndex(indexTestName);
                assert(false);
            } catch (e) {
                assert(e.body.error.type == "resource_already_exists_exception");
            }
            await deleteIndex();
        });
    });
    describe('Get Index', function () {
        it('No Parameter - Fail', async function () {
            try {
                await es.getIndex();
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Empty Parameter - Fail', async function () {
            try {
                await es.getIndex("");
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Get Existing Index', async function () {
            await createIndex();
            try {
                var index = await es.getIndex(indexTestName);
                assert(index[indexTestName] != null);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
        it('Get Non-Existing Index', async function () {
            await deleteIndex();
            try {
                await es.getIndex(indexTestName);
                assert(false);
            } catch (e) {
                assert(e.body.error.type == "index_not_found_exception");
            }
        });
    });
    describe('Delete Index', function () {
        it('No Parameter - Fail', async function () {
            try {
                await es.deleteIndex();
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Empty Parameter - Fail', async function () {
            try {
                await es.deleteIndex("");
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Delete Existing Index', async function () {
            await createIndex();
            try {
                var index = await es.deleteIndex(indexTestName);
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
        it('Delete Non-Existing Index', async function () {
            try {
                await es.deleteIndex(indexTestName);
                assert(false);
            } catch (e) {
                assert(e.body.error.type == "index_not_found_exception");
            }
        });
    });
    describe('Count', function () {
        it('No Parameter - Fail', async function () {
            try {
                await es.count();
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Empty Parameter - Fail', async function () {
            try {
                await es.count("");
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Count - Existing Index', async function () {
            await createIndex();
            try {
                var count = await es.count(indexTestName);
                assert(count.count == 0);
            } catch (e) {
                assert(false);
            }
        });
        it('Count - Non-Existing Index', async function () {
            try {
                const count = await es.count(indexTestName);
                assert(count.count == 0);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Bulk', function () {
        it('No Parameter - Fail', async function () {
            try {
                await es.bulk(null, null);
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Empty Parameter - Fail', async function () {
            try {
                await es.bulk("", "");
                assert(false);
            } catch (e) {
                assert(true);
            }
        });
        it('Bulk - Existing Index', async function () {
            await createIndex();
            try {
                var data = await es.bulk(indexTestName, testArray);
                assert(data.errors == false);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
        it('Bulk - Non-Existing Index', async function () {
            try {
                var data = await es.bulk(indexTestName, testArray);
                assert(data.errors == false);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
    });
});