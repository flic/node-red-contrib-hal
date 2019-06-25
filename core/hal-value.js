module.exports = function(RED) {
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

            switch (node.outputType) {
                case 'full':
                    var msgid = msg._msgid;
                    msg = item.msg;
                    msg._msgid = msgid;
                    break;
                case 'state':
                    msg.payload = item.state;
                    break;
                default:
                    msg.payload = eval('item.msg.'+node.outputValue);
                    break;
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("value",halValue);
}