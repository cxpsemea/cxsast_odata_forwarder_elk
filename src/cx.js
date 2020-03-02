const request = require("request-promise"),
    log = require("./logger").getLogger("cx"),
    rp = request.defaults({
        strictSSL: false,
        rejectUnauthorized: false,
        requestCert: false,
        agent: false
    }),
    dotenv = require('dotenv').config(),
    envs = process.env;

async function getOAuthToken(server, username, password) {
    log.debug("Retrieving OAuth token from Checkmarx Server %s...", server);
    var options = {
        method: 'POST',
        uri: server + '/cxrestapi/auth/identity/connect/token',
        form: {
            username: username,
            password: password,
            grant_type: "password",
            scope: "access_control_api sast_api",
            client_id: "resource_owner_sast_client",
            client_secret: "014DF517-39D1-4453-B7B3-9930C563627C",
        },
    };
    try {
        var tokenResponse = JSON.parse(await rp(options));
        return tokenResponse.token_type + " " + tokenResponse.access_token;
    } catch (e) {
        log.fatal("Unable to retrieve OAuth2 token from %s", server);
        throw new Error(e.message);
    }
}

async function getSizingData(server, username, password) {
    var token = await getOAuthToken(server, username, password);
    log.debug("Retrieving Sizing Data from Checkmarx Server %s...", server);
    var options = {
        method: 'GET',
        uri: server + "/cxwebinterface/odata/v1/Projects" +
            "?" +
            "$select=Id,Scans,TotalProjectScanCount,SchedulingExpression,CreatedDate" +
            "&" +
            "$expand=Scans(" +
            "$select=Id,ProductVersion,EngineServerId,ScanType,LOC,FailedLOC,FileCount,ScanRequestedOn,QueuedOn,EngineStartedOn,EngineFinishedOn,ScanCompletedOn,ScanDuration,IsIncremental,Origin;" +
            "$expand=Preset($select=Name,IsSystemPreset),ScannedLanguages($select=LanguageName),EngineServer($select=Id,Name,MaxConcurrentScans,ScanMinLOC,ScanMaxLOC))" + "&" +
            "$format=application/json;odata.metadata=none",
        headers: {
            "Authorization": token
        }
    };
    try {
        var sizingData = await rp(options);
        return JSON.parse(sizingData).value;
    } catch (e) {
        log.fatal("Unable to retrieve Sizing Data from %s", server);
        throw new Error(e.message);
    }
}


module.exports = {
    getOAuthToken: getOAuthToken,
    getSizingData: getSizingData
}