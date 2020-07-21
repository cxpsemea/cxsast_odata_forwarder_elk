const dotenv = require('dotenv').config(),
    fs = require("fs"),
    path = require("path"),
    log = require("./logger").getLogger("index"),
    time = require("./time"),
    es = require('./es'),
    kb = require('./kibana'),
    cx = require('./cx'),
    envs = process.env,
    customerName = envs.CUSTOMER ? envs.CUSTOMER : "Unknown",
    environmentName = envs.ENV ? envs.ENV : "Unknown",
    odataFilePath = envs.ODATA_FILE_PATH,
    cxServer = envs.CX_SERVER,
    cxUsername = envs.CX_USERNAME,
    cxPassword = envs.CX_PASSWORD,
    indexPrefix = envs.ES_INDEX_PREFIX ? envs.ES_INDEX_PREFIX.toLowerCase() : "cx_sizing_scans";

let index = es.getESIndex();
index = index ? index : "cx_sizing_scans_unknown";

async function processData() {
    var projects;
    if (odataFilePath) {
        log.info("Start Reading Data from file %s...", odataFilePath);
        projects = require(path.resolve(odataFilePath)).value;
    } else {
        if (cxServer && cxUsername && cxPassword) {
            log.info("Start Reading Data from server %s...", cxServer);
            log.info("Using User %s", cxUsername);
            projects = await cx.getSizingData(cxServer, cxUsername, cxPassword);
        } else {
            throw new Error("Envs missing: CX_SERVER && CX_USERNAME && CX_PASSWORD || ODATA_FILE_PATH");
        }
    }

    try {
        var indexRetrieved = await es.getIndex(index);
    } catch (e) {
        var indexCreated = await es.createIndex(index);
    }

    log.info("Start Reading Data...");
    log.info("Customer : %s", customerName);
    log.info("Environment : %s", environmentName);
    log.info("Elastic Seach Index : %s", index);
    var esScans = [];

    function printProgress(i, projects, scans) {
        log.info("(%f \%) - %d out of %d Projects - #Scans %d", ((i + 1) * 100 / (projects)).toFixed(2), i + 1, projects, scans);
    }

    for (var i = 0; i < projects.length; i++) {
        var json = {},
            projectScans = [],
            project = projects[i],
            scans = project.Scans;
        json.customerName = customerName;
        json.environmentName = environmentName;
        json.projectId = project.Id;
        json.projectCreatedDate = project.CreatedDate;
        json.projectSchedulingExpression = project.SchedulingExpression;
        json.projectTotalScans = project.TotalProjectScanCount;

        for (var j = 0; scans && j < scans.length ; j++) {
            var scan = scans[j],
                scanJson = JSON.parse(JSON.stringify(json));
            scanJson.scanId = scan.Id;
            scanJson.cxVersion = scan.ProductVersion;
            scanJson.scanType = scan.ScanType == 1 ? "Public" : "Private";
            scanJson.fileCount = scan.FileCount;
            scanJson.loc = scan.LOC;
            scanJson.failedLoc = scan.FailedLOC;

            scanJson.scanRequestedOn = scan.ScanRequestedOn;
            scanJson.queuedOn = scan.QueuedOn;
            scanJson.timeFromRequestToQueue = time.getDuration(scanJson.scanRequestedOn, scanJson.queuedOn);

            scanJson.engineStartedOn = scan.EngineStartedOn;
            scanJson.timeFromQueueToEngine = time.getDuration(scanJson.queuedOn, scanJson.engineStartedOn);

            scanJson.engineFinishedOn = scan.EngineFinishedOn;
            scanJson.timeFromEngineStartToEngineEnd = time.getDuration(scanJson.engineStartedOn, scanJson.engineFinishedOn);

            scanJson.scanCompletedOn = scan.ScanCompletedOn;
            scanJson.timeFromEngineEndToScanCompleted = time.getDuration(scanJson.engineFinishedOn, scanJson.scanCompletedOn);
            scanJson.timeFromRequestToScanCompleted = time.getDuration(scanJson.scanRequestedOn, scanJson.scanCompletedOn);

            scanJson.scanDuration = scan.ScanDuration;

            scanJson.isIncremental = scan.IsIncremental;
            scanJson.origin = scan.Origin;
            var languages = scan.ScannedLanguages,
                auxLanguageArray = [];
            for (var k = 0; k < languages.length; k++) {
                var language = languages[k].LanguageName;
                if (language.toLowerCase() != "Common".toLowerCase()) {
                    auxLanguageArray.push(language);
                }
            }
            scanJson.languages = auxLanguageArray.toString();
            scanJson.totalLanguages = auxLanguageArray.length;
            var engine = scan.EngineServer;
            if (engine) {
                scanJson.engineId = engine.Id;
                scanJson.engineMaxConcurrentScans = engine.MaxConcurrentScans
                scanJson.engineMinLoc = engine.ScanMinLOC;
                scanJson.engineMaxLoc = engine.ScanMaxLOC;
            } else {
                log.error("Invalid Engine for Scan ID %d", scanJson.scanId);
            }
            var preset = scan.Preset;
            if (preset) {
                scanJson.presetName = preset.Name;
                scanJson.presetIsSystem = preset.IsSystemPreset;
            } else {
                log.error("Invalid Preset for Scan ID %d", scanJson.scanId);
            }
            projectScans.push(scanJson);
        }

        if (!scans || scans.length == 0) {
            projectScans.push(json);
        }

        var data = await es.bulk(index, projectScans);
        if (data.errors) {
            log.error(data.errors);
        }
        if(projects && projects.length && project && project.Scans){
            printProgress(i, projects.length, project.Scans.length);
        }
        esScans = esScans.concat(projectScans);
    }
    if (projects && projects.length > 0) {

        /*var isAvailable = await kb.isAvailable();
        if (isAvailable) {
            var indexPrefixCreated = await kb.createIndexPattern(indexPrefix + "*", "scanRequestedOn");
        }*/


        var folder = __dirname + "/../generated/";
        try {
            fs.mkdirSync(folder);
            fs.writeFile(folder + "/" + customerName.toLowerCase() + environmentName.toLowerCase() + ".json", JSON.stringify(scans), {
                flag: 'wx'
            }, function (err) {
                if (err) throw err;

                log.info("Total Projects: %d", projects.length);
                log.info("Total Scans: %d", esScans.length);
                log.info("Average Scans per Project: %f", (esScans.length / projects.length).toFixed(2));
                log.info("END!");
            });
        } catch (e) {
            log.info("Total Projects: %d", projects.length);
            log.info("Total Scans: %d", esScans.length);
            log.info("Average Scans per Project: %f", (esScans.length / projects.length).toFixed(2));
            log.info("END!");
        }
    } else {
        log.info("No projects found for %s %s", customerName, environmentName);
        log.info("END!");
    }
}

processData();