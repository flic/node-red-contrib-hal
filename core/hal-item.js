module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halItem(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.topic = config.topic;
        this.filter = config.filter;
        this.identifier = config.identifier;
        this.output = config.output;
        this.stateProperty = config.stateProperty;
        this.propertyType = config.propertyType;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        this.bootstrap = config.bootstrap;
        this.bootstrapValue = config.bootstrapValue;
        this.bootstrapType = config.bootstrapType;
        this.events = RED.nodes.getNode(config.config);

        var node = this;
        utils.showState(node,null);

        // Send bootstrap output
        if (node.bootstrap === true) {
            setTimeout(function() {
                node.emit("input",null);
            },0);
        }

        node.on('input', function(msg) {
            if (msg == null) {
                if (node.output === true) {
                    var msg = {};
                    msg.payload = RED.util.evaluateNodeProperty(node.bootstrapValue,node.bootstrapType,node);
                    msg._msgid = RED.util.generateId();
                    msg.topic = node.topic ? node.topic : null;
                    msg.id = node.identifier ? node.identifier : null;
                    node.send(msg);
                }
                return;
            }

            if (node.filter === true && msg.topic !== node.topic) {
                node.debug("msg.topic doesn't match configured value and filter is enabled. Dropping message.");
                return;
            }
            msg.topic = node.topic ? node.topic : msg.topic;
            msg.id = node.identifier ? node.identifier : msg.id;

            // Store msg
            node.msg = msg;

            // Show value on node
            node.oldState = node.state ? node.state : "";
            node.state = eval('msg.'+node.stateProperty);
            
            utils.showState(node,node.state);
            
            node.events.event(node.id,node);

            if (node.output === true) {
                msg.payload = utils.generatePayload[node.outputType](msg,node.outputValue,node.state);
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("item",halItem);
}