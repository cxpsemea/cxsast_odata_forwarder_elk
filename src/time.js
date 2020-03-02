const moment = require("moment");

function isValidDate(date){
    if(date){
        return moment(date).isValid();
    } else {
        return false;
    }
}

function getDuration(startDate, endDate){
    if(startDate && endDate && isValidDate(startDate) && isValidDate(endDate)){
        return moment.duration(moment(endDate).diff(moment(startDate))).asMilliseconds();
    } else {
        return null;
    }
}

module.exports = {
    isValidDate: isValidDate,
    getDuration: getDuration
};