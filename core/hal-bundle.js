module.exports = function(RED) {
    function halBundle(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.bundleset = config.bundleset;
        this.ratelimit = config.ratelimit;
        var pause = 0;

        var node = this;

        function queueMsg(msg) {
            setTimeout(() => { node.send(msg); }, pause);

            if (node.ratelimit > 0) {
                pause += node.ratelimit;
                setTimeout(() => { if (pause > 0) { pause -= node.ratelimit}; }, pause);
            }
        }   

        node.on('input', function(msg) {
            for (var i = 0; i < node.bundleset.length; i += 1) {
                var bundle = node.bundleset[i];
                var item = RED.nodes.getNode(bundle.item);
                var msgOut = Object.assign({}, msg);
                msgOut.topic = item.topic ? item.topic : msg.topic;
                msgOut.name = item.name;
                if (bundle.type == 'state') {
                    msgOut.payload = item.state;
                } else {
                    msgOut.payload = RED.util.evaluateNodeProperty(bundle.value,bundle.type,node,msg);
                }
                queueMsg(msgOut);
            }
        });
    }
    RED.nodes.registerType("bundle",halBundle);
}