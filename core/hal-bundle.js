module.exports = function(RED) {
    function halBundle(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.bundleset = config.bundleset;
        this.ratelimit = Number(config.ratelimit);
        var qLast = null;
        var queue = [];
        var node = this;

        if (isNaN(this.ratelimit)) { this.ratelimit = 0}

        function queueSend() {
            const date = Date.now();
            if (date - qLast > node.ratelimit) {
                if (Object.keys(queue).length > 0) {
                    qLast = date;
                    node.send(queue[0]);
                    queue.shift();
                }

                if (Object.keys(queue).length > 0) {
                    setTimeout(() => { queueSend(); },node.ratelimit)
                }
            } else {
                setTimeout(() => { queueSend(); }, node.ratelimit-(date-qLast));
            }

            if (Object.keys(queue).length > 0) {
                node.status({text:Object.keys(queue).length > 0});
            } else {
                node.status({});
            }
        }

        node.on('input', function(msg) {
            for (var i = 0; i < node.bundleset.length; i += 1) {
                var bundle = node.bundleset[i];
                var item = RED.nodes.getNode(bundle.item);
                var msgOut = Object.assign({}, msg);
                msgOut.topic = item.topic ? item.topic : msg.topic;
                msgOut.name = item.name;

                switch (bundle.type) {
                    case 'state':
                        msgOut.payload = item.state;
                        break;
                    case 'msg':
                        msgOut.payload = RED.util.getMessageProperty(msg,bundle.value);
                        break;
                    case 'flow':
                        msgOut.payload = node.context().flow.get(bundle.value);
                        break;
                    case 'global':
                        msgOut.payload = node.context().global.get(bundle.value);
                        break;
                    case 'env':
                        msgOut.payload = process.env[bundle.value];
                        break;
                    default:
                        msgOut.payload = RED.util.evaluateNodeProperty(bundle.value,bundle.type);
                }
                queue.push(msgOut);
            }
            queueSend();
        });
    }
    RED.nodes.registerType("bundle",halBundle);
}