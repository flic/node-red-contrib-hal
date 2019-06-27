module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halValue(config) {
        RED.nodes.createNode(this,config);
        this.item = config.item;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        var node = this;

        node.on('input', function(msg) {
            var item = RED.nodes.getNode(node.item);

            if (!item.hasOwnProperty('msg')) {
                // No value stored in item
                return;
            }

            if (node.outputType == 'full') {
                var msgid = msg._msgid;
                msg = item.msg;
                msg._msgid = msgid;
            } else {
                msg.payload =  utils.generatePayload[node.outputType](msg,node.outputValue,item.state);
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("value",halValue);
}