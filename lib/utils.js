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

var generateMsg = {
    'full': function (msg) {return msg; },
    'state': function (msg,value,item) { msg.payload = item.state; return msg;},
    'msg': function (msg,value,item) {msg.payload = eval("item.msg."+value); return msg; },
    'flow': function (msg,value) {msg.payload = eval("node.context().flow.get('"+value+"')"); return msg;},
    'global': function (msg,value) {msg.payload = eval("node.context().global.get('"+value+"')"); return msg;},
    'bool': function (msg,value) {msg.payload = (value === 'true'); return msg; },
    'num': function (msg,value) {msg.payload = Number(value); return msg; },
    'str': function (msg,value) {msg.payload = value; return msg; },
    'json': function (msg,value) {msg.payload = JSON.parse(value); return msg; }
};

var convertTo = {
    'num': function (value) { return Number(value); },
    'str': function (value) { return value; },
    'bool': function (value) { return (value === 'true'); },
    'json': function (value) { return JSON.parse(value); }
};

function showState(node,state) {

    if (!state) {
        node.status({fill:"gray",shape:"ring",text:"no value"});
        return;
    }
    
    switch(typeof state) {
        case "boolean":
            if (state) {
                node.status({fill:"green",shape:"dot",text:itemValue});
            } else {
                node.status({fill:"gray",shape:"ring",text:itemValue});
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
    generateMsg : generateMsg,
    convertTo: convertTo,
    showState: showState
}