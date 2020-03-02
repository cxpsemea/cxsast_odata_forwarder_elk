const es = require('elasticsearch'),
    crypto = require('crypto'),
    dotenv = require('dotenv').config(),
    flatmap = require('array.prototype.flatmap').shim(),
    log = require("./logger").getLogger("elasticsearch"),
    envs = process.env,
    server = envs.ES_SERVER ? envs.ES_SERVER : "http://localhost:9200",
    version = envs.ES_VERSION ? envs.ES_VERSION : "7.2.0",
    customer = envs.CUSTOMER ? envs.CUSTOMER.toLowerCase() : "unknown",
    environment = envs.ENV ? envs.ENV.toLowerCase() : "unknown",
    indexPrefix = envs.ES_INDEX_PREFIX ? envs.ES_INDEX_PREFIX.toLowerCase() : "cx_sizing_scans",
    idSecret = envs.ES_ID_SECRET ? envs.ES_ID_SECRET : "cx_sizing",
    client = getClient();

function getClient() {
    try {
        log.debug("Retrieving ES Client %s - %s", server, version);
        return new es.Client({
            host: server,
            apiVersion: version
        });
    } catch (e) {
        log.fatal("Unable to get client Elastic Search %s", server);
        throw new Error(e.message);
    }
}

function getHash(id) {
    if (id) {
        try {
            return crypto.createHmac('sha256', idSecret)
                .update(id)
                .digest('hex');
        } catch (e) {
            log.fatal("Unable to retrieve hash for id %s", id);
            throw Error(e.message);
        }
    } else {
        log.fatal("Unable to retrieve hash for id %s", id);
        throw Error("Missing id");
    }
}

function getESIndex() {
    log.debug("Retrieving ES index...");
    return indexPrefix + "_" + customer + "_" + environment;
}

function getIdForDoc(doc) {
    return getHash(doc.customerName + doc.environmentName + doc.cxVersion + doc.projectId + doc.scanId);
}

async function ping() {
    try {
        log.debug("Pinging ES Server %s...", server);
        return client.ping({
            requestTimeout: 20000,
        });
    } catch (e) {
        log.fatal("Unable to ping Elastic Search %s", server);
        throw new Error(e.message);
    }
}

async function createIndex(index) {
    if (index) {
        try {
            log.debug("Creating Index %s...", index);
            return client.indices.create({
                index: index
            });
        } catch (e) {
            log.fatal("Unable to create index %s Elastic Search %s", index, server);
            throw new Error(e.message);
        }
    } else {
        throw Error("Missing index");
    }
}

async function getIndex(index) {
    if (index) {
        try {
            log.debug("Retrieving Index %s...", index);
            return client.indices.get({
                index: index
            });
        } catch (e) {
            log.fatal("Unable to get index %s Elastic Search %s", index, server);
            throw new Error(e.message);
        }
    } else {
        throw Error("Missing index");
    }
}

async function deleteIndex(index) {
    if (index) {
        try {
            log.debug("Deleting Index %s...", index);
            return client.indices.delete({
                index: index
            });
        } catch (e) {
            log.fatal("Unable to delete index %s Elastic Search %s", index, server);
            throw new Error(e.message);
        }
    } else {
        throw Error("Missing index");
    }
}

async function count(index) {
    if (index) {
        try {
            log.debug("Counting Index %s...", index);
            return client.count({
                index: index
            });
        } catch (e) {
            log.fatal("Unable to get count for index %s Elastic Search %s", index, server);
            throw new Error(e.message);
        }
    } else {
        throw Error("Missing index");
    }
}

async function bulk(index, array) {
    if (index && array) {
        const body = array.flatMap(doc => [{
            index: {
                _index: index,
                _id: getIdForDoc(doc)
            }
        }, doc]);
        try {
            log.debug("Insert bulk for Index %s...", index);
            return client.bulk({
                refresh: true,
                body
            });
        } catch (e) {
            log.fatal("Unable to insert bulk for index %s Elastic Search %s", index, server);
            throw new Error(e.message);
        }
    } else {
        throw Error("Missing Index | Array");
    }
}

module.exports = {
    getHash: getHash,
    getESIndex: getESIndex,
    ping: ping,
    createIndex: createIndex,
    getIndex: getIndex,
    deleteIndex: deleteIndex,
    count: count,
    bulk: bulk
};