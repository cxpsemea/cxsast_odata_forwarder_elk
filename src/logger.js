var log4js = require("log4js"),
  getLogger = function(name) {
    log4js.configure({
      appenders: {
        console: {
          type: "console",
          layout: {
            type: "basic"
          }
        }
      },
      categories: {
        default: {
          appenders: ["console"],
          level: "trace"
        }
      }
    });
    if(!name){
        name = "Unknown";
    }
    return log4js.getLogger("[" + name.toUpperCase() + "]");
  };

module.exports = {
  getLogger: getLogger
};
