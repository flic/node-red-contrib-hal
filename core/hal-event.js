module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halEvent(config) {
        RED.nodes.createNode(this,config);
        this.trigger = config.trigger;
        this.operator = config.operator;
        this.compareValue = config.compareValue;
        this.compareType = config.compareType;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        var node = this;

        node.events = RED.nodes.getNode(config.config);

        //Convert types
        node.compareValue = utils.convertTo[node.compareType](node.compareValue);

        node.listener = function(event) {
            if (utils.compare[node.operator](event.state,node.compareValue,event.oldState)){
                var msg = {};
                msg._msgid = RED.util.generateId();
                msg.topic = event.topic ? event.topic : undefined;
                msg.id = event.identifier ? event.identifier : undefined;
                msg.name = event.name;
                if (node.outputType == 'state') {
                    msg.payload = event.state;
                } else {
                    msg.payload  = RED.util.evaluateNodeProperty(node.outputValue,node.outputType,node,event);
                }
                node.send(msg);
            }
        }
            
        node.events.addListener(node.trigger, node.listener);
        node.on("close",function() { 
            if (node.listener) {
                node.events.removeListener(node.trigger, node.listener);
            }
        });
    }
    RED.nodes.registerType("event",halEvent);
}