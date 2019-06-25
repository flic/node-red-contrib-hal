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
        this.events = RED.nodes.getNode(config.config);

        var node = this;
        utils.showState(node,null);

        node.on('input', function(msg) {
            if (node.filter === true && msg.topic !== node.topic) {
                node.debug("msg.topic doesn't match configured value and filter is enabled. Dropping message.");
                return;
            }
            msg.topic = node.topic ? node.topic : msg.topic;
            msg.id = node.identifier ? node.identifier : msg.id;

            // Store msg
            node.msg = msg;

            // Show value on node
            var state = eval('msg.'+node.stateProperty);
            node.oldState = node.state ? node.oldState : "";
            node.state = state;
            utils.showState(node,state);
            
            node.events.event(node.id,node);

            if (node.output === true) {
                switch (node.outputType) {
                    case 'full':
                        break;
                    case 'state':
                        msg.payload = node.state;
                        break;
                    case 'msg':
                        msg.payload = eval('msg.'+node.outputValue);
                        break;
                }

                node.send(msg);
            }

        });
    }
    RED.nodes.registerType("item",halItem);
}