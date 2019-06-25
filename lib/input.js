var GenericBoolean = function(msg) {
    if (msg.payload === true || msg.payload === false) {
        var itemValue = msg.payload;
        return itemValue;
    } else {
        return null;
    }
}

var GenericValue = function(msg) {
    if (!isNaN(parseFloat(msg.payload)) && isFinite(msg.payload)) {
        var itemValue = msg.payload;
        return itemValue;
    } else {
        return null;
    }
}

var HueSensorPresence = function(msg) {
    if (msg.payload.hasOwnProperty("type") && msg.payload.type == "ZLLPresence") {
        var itemValue = msg.payload.state.presence;
        return itemValue;
    } else {
        return null;
    }
}


module.exports = {
    GenericBoolean: GenericBoolean,
    GenericValue: GenericValue,
    HueSensorPresence: HueSensorPresence
}