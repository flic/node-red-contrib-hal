module.exports = function(RED) {
    function halConfig(n) {
        RED.nodes.createNode(this,n);
        this.host = n.name;
        var node = this;

        this.setMaxListeners(0);

        this.event = function (type, payload) {
            this.emit(type, payload);
        }

    }
    RED.nodes.registerType("event-config",halConfig);
}