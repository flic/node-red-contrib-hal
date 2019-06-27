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

                msg.topic = item.topic ? item.topic : msg.topic;
                msg.id = item.identifier ? item.identifier : msg.id;
                msg.name = item.name;

                if (bundle.type == 'state') {
                    msg = utils.generateMsg[bundle.type](msg,null,item)
                } else {                
                    msg = utils.generateMsg[bundle.type](msg,bundle.value,msg);
                }
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("bundle",halBundle);
}