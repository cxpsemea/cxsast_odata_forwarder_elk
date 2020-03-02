var assert = require('assert'),
    kb = require("./../src/kibana"),
    indexTestName = "cx*";

async function deleteIndex(){
    await kb.deleteIndexPattern(indexTestName);
}

async function createIndex(){
    await kb.createIndexPattern(indexTestName);
}

describe('Kibana', function () {
    describe('Is Available', function () {
        it('Is Available', async function () {
            try {
                var status = await kb.isAvailable();
                assert(status);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Create Index', function () {
        it('Create Index', async function () {
            await deleteIndex();
            try {
                var created = await kb.createIndexPattern(indexTestName, "");
                assert(true);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
    });
    describe('Get Indexes', function () {
        it('Get Indexes', async function () {
            try {
                var indexes = await kb.getIndexPatterns();
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });
    describe('Get Index By Name', function () {
        it('Get Index By Name', async function () {
            await createIndex();
            try {
                var index = await kb.getIndexPatternByName(indexTestName);
                assert(true);
            } catch (e) {
                assert(false);
            }
            await deleteIndex();
        });
    });
    describe('Delete Index By Name', function () {
        it('Delete Index By Name', async function () {
            await createIndex();
            try {
                var index = await kb.deleteIndexPattern(indexTestName);
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });
});