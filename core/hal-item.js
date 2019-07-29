module.exports = function(RED) {
    var utils = require("../lib/utils");

    function checkRule(rule,state,ruleMatch) {
        switch (rule.ct) {
            case 'otherwise':
                return (ruleMatch == 0);
                break;
            case 'always':
                return true;
                break;
            case 'str':
            case 'num':
            case 'bool':
                rule.cv = utils.convertTo[rule.ct](rule.cv);
                return (rule.cv === state);
                break;
            case 're':
                return (state + "").match(new RegExp(rule.cv));
            case 'gt':
                return (state > Number(rule.cv));
                break;
            case 'lt':
                return (state < Number(rule.cv));
                break;
            default:
                return false;
        }
    }

    function halItem(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.topic = config.topic;
        this.filter = config.filter;
        this.identifier = config.identifier;
        this.output = config.output;
        this.stateProperty = config.stateProperty;
        this.rules = config.rules;
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
                // Bootstrap
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

            //Set state
            var state = RED.util.evaluateNodeProperty(node.stateProperty,'msg',node,msg);

            var ruleMatch = 0;
            for (var i = 0; i < node.rules.length; i += 1) {
                var rule = node.rules[i];
                if (checkRule(rule,state,ruleMatch)) {
                    ruleMatch++;
                    switch (rule.rt) {
                        case 'str':
                        case 'num':
                        case 'bool':
                            state = utils.convertTo[rule.rt](rule.rv);
                            break;
                        case 'toNumber':
                            if (typeof state == "string" || typeof state == "number") {
                                state = Number(state);
                            } else {
                                node.warn("Convert to number is selected but input value is not a string. Dropping message.");
                                return;
                            }
                            break;
                        case 'modify':
                            //Modifies state value according to modifier
                            //Thank you to Daniel Lando (https://github.com/robertsLando) for the idea
                            if (/^[0-9.()\-+*/]*$/.test(rule.rv)) {
                                if (typeof state == "number") {
                                    state=eval(state + rule.rv);
                                } else {
                                    node.warn("A valid modifier is configured but input value is not a number. Dropping message.");
                                    return;  
                                }
                            }
                            break;
                        case 'drop':
                            return;
                            break;
                    }
                }
            }

            node.oldState = node.state ? node.state : "";
            node.state = state;

            // set topic & id
            msg.topic = node.topic ? node.topic : msg.topic;
            msg.id = node.identifier ? node.identifier : msg.id;

            // Store msg.payload
            node.payload = msg.payload;
                        
            utils.showState(node,node.state);
            
            //node.events.event(node.id,node);

            if (node.output === true) {
                if (node.outputType == 'state') {
                    msg.payload = node.state;
                } else {
                    msg.payload = RED.util.evaluateNodeProperty(node.outputValue,node.outputType,node,msg);
                }
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("item",halItem);
}