module.exports = function(RED) {
    var utils = require("../lib/utils");

    function checkRules(node) {
        var ruleMatch = 0;
        for (var i = 0; i < node.rules.length; i += 1) {
            var rule = node.rules[i];
            var item = RED.nodes.getNode(rule.item);

            rule.value = utils.convertTo[rule.type](rule.value);

            if (item.hasOwnProperty('msg')) {
                if (utils.compare[rule.operator](item.state,rule.value,item.oldState)){
                    ruleMatch ++;
                }
            }
        }

        if (node.checkall === 'true') {
            if (ruleMatch == node.rules.length) {
                node.status({fill:"green",shape:"dot",text:ruleMatch + "/" + node.rules.length});
                return true;
            } else {
                node.status({fill:"red",shape:"ring",text:ruleMatch + "/" + node.rules.length});
                return false;
            }
        } else {
            if (ruleMatch > 0) {
                node.status({fill:"green",shape:"dot",text:ruleMatch + "/" + node.rules.length});
                return true;
            } else {
                node.status({fill:"red",shape:"ring",text:ruleMatch + "/" + node.rules.length});
                return false;
            }
        }
    }

    function halGate(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.rules = config.rules;
        this.checkall = config.checkall;
        var node = this;

        node.events = RED.nodes.getNode(config.config);

        var gateOpen = checkRules(node);

        node.on('input', function(msg) {
            if (gateOpen) {
                node.send([msg,null]);
            } else {
                node.send([null,msg]);
            }
        });
        
        node.listener = function(event) {
            gateOpen = checkRules(node);
        }

        for (var r in node.rules) {
            node.events.addListener(node.rules[r].item, node.listener);
        }
        
        node.on("close",function() { 
            if (node.listener) {
                for (var r in node.rules) {
                    node.events.removeListener(node.rules[r].item, node.listener);
                }
            }
        });
    }
    RED.nodes.registerType("gate",halGate);
}