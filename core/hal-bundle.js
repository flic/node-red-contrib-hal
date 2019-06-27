module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halBundle(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.bundleset = config.bundleset;

        var node = this;

        node.on('input', function(msg) {
            for (var i = 0; i < this.bundleset.length; i += 1) {
                var bundle = node.bundleset[i];
                var item = RED.nodes.getNode(bundle.item);
                var msgOut = Object.assign({}, msg);
                msgOut.topic = item.topic ? item.topic : msg.topic;
                msgOut.id = item.identifier ? item.identifier : msg.id;
                msgOut.name = item.name;
                msgOut.payload = utils.generatePayload[bundle.type](msg,bundle.value,item.state);
                node.send(msgOut);
            }
        });
    }
    RED.nodes.registerType("bundle",halBundle);
}