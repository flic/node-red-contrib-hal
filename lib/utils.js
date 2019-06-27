var compare = {
    'update': function () {return true;},
    'change': function (a,b,c) {return a !== c},
    'eq': function (a, b) { return a === b; },
    'neq': function (a, b) { return a !== b; },
    'lt': function (a, b) { return a < b; },
    'lte': function (a, b) { return a <= b; },
    'gt': function (a, b) { return a > b; },
    'gte': function (a, b) { return a >= b; },
    'btwn': function (a, b, c) { return a >= b && a <= c; },
    'cont': function (a, b) { return (a + "").indexOf(b) !== -1; },
    'regex': function (a, b) { return (a + "").match(new RegExp(b)); },
    'true': function (a) { return a === true; },
    'false': function (a) { return a === false; },
    'null': function (a) { return typeof a === "undefined"; },
    'nnull': function (a) { return typeof a !== "undefined"; }
};

var generatePayload = {
    'state': function (msg,value,state) { return state ? state : ""; },
    'msg': function (msg,value) {return eval("msg."+value); },
    'flow': function (msg,value) {return eval("node.context().flow.get('"+value+"')");},
    'global': function (msg,value) {return eval("node.context().global.get('"+value+"')");},
    'bool': function (msg,value) {return (value === 'true'); },
    'num': function (msg,value) {return Number(value); },
    'str': function (msg,value) {return value; },
    'json': function (msg,value) {return JSON.parse(value); }
};

var convertTo = {
    'num': function (value) { return Number(value); },
    'str': function (value) { return value; },
    'bool': function (value) { return (value === 'true'); },
    'json': function (value) { return JSON.parse(value); }
};

function showState(node,state) {

    if (state == null) {
        node.status({fill:"gray",shape:"ring",text:"no value"});
        return;
    }
    
    switch(typeof state) {
        case "boolean":
            if (state) {
                node.status({fill:"green",shape:"dot",text:state});
            } else {
                node.status({fill:"gray",shape:"ring",text:state});
            }
            break;
        case "number":
            if (state > 0) {
                node.status({fill:"green",shape:"dot",text:state});
            } else {
                node.status({fill:"gray",shape:"ring",text:state});
            }
            break;
        case "string":
                if (state != '') {
                    node.status({fill:"green",shape:"dot",text:state});
                } else {
                    node.status({fill:"gray",shape:"ring",text:state});
                }
            break;
        default:
            node.status({text:"unknown"});
            break;
    }
}

module.exports = {
    compare: compare,
    generatePayload: generatePayload,
    convertTo: convertTo,
    showState: showState
}