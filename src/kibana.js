const request = require("request-promise"),
    log = require("./logger").getLogger("kibana"),
    rp = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false,
        requestCert: false,
        agent: false
    }),
    dotenv = require('dotenv').config(),
    envs = process.env,
    kbServer = envs.KIBANA_SERVER ? envs.KIBANA_SERVER : "http://localhost:5601";

async function isAvailable() {
    log.debug("Check Status Kibana Server %s...", kbServer);
    var options = {
        method: 'GET',
        uri: kbServer + '/api/status',
    };
    try {
        var status = JSON.parse(await rp(options));
        return true;
    } catch (e) {
        log.fatal("Unable to check status of Kibana Server %s", kbServer);
        throw new Error(e.message);
    }
}

async function createIndexPattern(index, timeFieldName) {
    log.debug("Creating Index %s for Kibana Server %s...", index, kbServer);
    if (index) {
        var indexPattern = await getIndexPatternByName(index);
        if (!indexPattern) {
            var options = {
                method: 'POST',
                uri: kbServer + '/api/saved_objects/index-pattern',
                headers: {
                    "kbn-xsrf": "true"
                },
                body: {
                    "attributes": {
                        "title": index,
                        "timeFieldName": timeFieldName
                    }
                },
                json: true
            };
            try {
                var indexCreated = await rp(options);
                return true;
            } catch (e) {
                log.fatal("Unable to create index %s for Kibana Server %s", index, kbServer);
                throw new Error(e.message);
            }
        } else {
            return true;
        }
    } else {
        throw Error("Missing index");
    }
}
async function getIndexPatterns() {
    log.debug("Getting Indexes for Kibana Server %s...", kbServer);
    var options = {
        method: 'GET',
        uri: kbServer + '/api/saved_objects/_find?type=index-pattern&fields=title&fields=type&per_page=10000'
    };
    try {
        var indexPatterns = JSON.parse(await rp(options));
        return indexPatterns.saved_objects;
    } catch (e) {
        log.fatal("Unable to get indexes for Kibana Server %s", kbServer);
        throw new Error(e.message);
    }
}

async function getIndexPatternByName(index) {
    log.debug("Getting Index %s for Kibana Server %s...", index, kbServer);

    if (index) {
        var indexPatterns = await getIndexPatterns();
        for (var i = 0; i < indexPatterns.length; i++) {
            var indexPattern = indexPatterns[i];
            if (indexPattern.attributes.title == index) {
                return indexPattern;
            }
        }
        log.error("Index %s was not found for Kibana Server %s...", index, kbServer);
        return false;
    } else {
        throw Error("Missing index");
    }

}


async function deleteIndexPattern(index) {
    log.debug("Deleting Index %s for Kibana Server %s...", index, kbServer);
    if (index) {
        var indexObject = await getIndexPatternByName(index);
        if (indexObject) {
            var options = {
                method: 'DELETE',
                uri: kbServer + '/api/saved_objects/index-pattern/' + indexObject.id,
                headers: {
                    "kbn-xsrf": "true"
                }
            };
            try {
                var indexDeleted = await rp(options);
                return true;
            } catch (e) {
                log.fatal("Unable to delete index %s for Kibana Server %s", index, kbServer);
                throw new Error(e.message);
            }
        } else {
            return true;
        }
    } else {
        throw Error("Missing index");
    }
}

module.exports = {
    isAvailable: isAvailable,
    createIndexPattern: createIndexPattern,
    getIndexPatterns: getIndexPatterns,
    getIndexPatternByName: getIndexPatternByName,
    deleteIndexPattern: deleteIndexPattern
}