module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halEvent(config) {
        RED.nodes.createNode(this,config);
        this.item = config.item;
        this.operator = config.operator;
        this.change = config.change;
        this.compareValue = config.compareValue;
        this.compareType = config.compareType;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        var node = this;

        node.events = RED.nodes.getNode(config.config);

        //Convert types
        var convertedCompareValue = utils.convertTo[node.compareType](node.compareValue);

        node.listener = function(event) {
            if (node.change === 'true') { node.change = '1'}
            if (node.change == '2' && event.oldState == undefined) { return; }
            if (node.change == '1' && event.state === event.oldState) { return; }
            if (utils.compare[node.operator](event.state,convertedCompareValue,event.oldState)){
                var msg = {};
                msg._msgid = RED.util.generateId();
                msg.topic = event.topic ? event.topic : undefined;
                msg.name = event.name;

                switch (node.outputType) {
                    case 'state':
                        msg.payload = event.state;
                        break;
                    case 'msg':
                        msg.payload = RED.util.getMessageProperty(event,node.outputValue);
                        break;
                    case 'flow':
                        msg.payload = node.context().flow.get(node.outputValue);
                        break;
                    case 'global':
                        msg.payload = node.context().global.get(node.outputValue);
                        break;
                    case 'env':
                        msg.payload = process.env[node.outputValue];
                        break;
                    default:
                        msg.payload = RED.util.evaluateNodeProperty(node.outputValue,node.outputType);
                }
                node.send(msg);
            }
        }
            
        node.events.addListener(node.item, node.listener);
        node.on("close",function() { 
            if (node.listener) {
                node.events.removeListener(node.item, node.listener);
            }
        });
    }
    RED.nodes.registerType("event",halEvent);
}