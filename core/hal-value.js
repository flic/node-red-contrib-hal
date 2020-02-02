module.exports = function(RED) {
    function halValue(config) {
        RED.nodes.createNode(this,config);
        this.item = config.item;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        var node = this;

        node.on('input', function(msg) {
            var item = RED.nodes.getNode(node.item);

            if (!item.hasOwnProperty('payload')) {
                // No value stored in item
                return;
            }

            msg.topic = item.topic ? item.topic : msg.topic;
            msg.name = item.name;

            if (node.outputType == 'state') {
                msg.payload = item.state;
            } else {
                msg.payload = RED.util.getMessageProperty(item,node.outputValue);
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("value",halValue);
}