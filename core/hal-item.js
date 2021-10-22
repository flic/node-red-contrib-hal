module.exports = function(RED) {
    var utils = require("../lib/utils");
    var MQTTPattern = require("mqtt-pattern");

    //a=msg.topic, b=filter
    var checkFilter = {
        'str': function (a, b) { return a === b; },
        're': function (a, b) { return (new RegExp(b)).test(a+""); },
        'mqtt': function (a,b) { return MQTTPattern.matches(b,a); }
    };

    function showState(node,state) {
        if (state === null) {
            node.status({fill:"gray",shape:"ring",text:"no value"});
            return;
        }
        switch(typeof state) {
            case "boolean":
                if (state) {
                    node.status({fill:"green",shape:"dot",text:state});
                } else {
                    node.status({fill:"gray",shape:"ring",text:state});
                }
                break;
            case "number":
                if (state > 0) {
                    node.status({fill:"green",shape:"dot",text:state});
                } else {
                    node.status({fill:"gray",shape:"ring",text:'0'});
                }
                break;
            case "string":
                    if (state != '') {
                        node.status({fill:"green",shape:"dot",text:state});
                    } else {
                        node.status({fill:"gray",shape:"ring",text:state});
                    }
                break;
            default:
                node.status({text:"unknown"});
                break;
        }
    }

    function halItem(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.topic = config.topic;
        this.filter = config.filter;
        this.filterType = config.filterType;        
        this.output = config.output;
        this.stateProperty = config.stateProperty;
        this.rules = config.rules;
        this.propertyType = config.propertyType;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        this.outputOnChange = config.outputOnChange;
        this.bootstrap = config.bootstrap;
        this.bootstrapValue = config.bootstrapValue;
        this.bootstrapType = config.bootstrapType;
        this.events = RED.nodes.getNode(config.config);
        var node = this;
        showState(node,null);

        // Send bootstrap output
        if (node.bootstrap === true) {
            setTimeout(function() {
                var msg = {};
                msg.payload = RED.util.evaluateNodeProperty(node.bootstrapValue,node.bootstrapType,node);
                msg._msgid = RED.util.generateId();
                msg.topic = node.topic ? node.topic : null;
                msg.bootstrap = true;
                node.emit("input",msg);
            },0);
        }

        node.on('input', function(msg) {
            if (msg.bootstrap == true) {
                // Bootstrap
                if (node.output === true) {
                    node.send(msg);
                }
                return;
            }

            if (node.filter) {
                if (checkFilter[node.filterType](msg.topic,node.filter) === false) {
                    node.debug("msg.topic doesn't match configured filter value. Dropping message.");
                    return;
                }
            }

            var state =  RED.util.getMessageProperty(msg,node.stateProperty);

            var ruleMatch = 0;
            for (var i = 0; i < node.rules.length; i += 1) {
                var rule = node.rules[i];
                if (rule.hasOwnProperty('pt') === false) {
                    rule.pt = 'state';
                }
                rule.cv = utils.convertTo[rule.ct](rule.cv);

                var compareValue;
                switch (rule.pt) {
                    case 'state':
                        compareValue = state;
                        break;
                    case 'msg':
                        compareValue = RED.util.getMessageProperty(msg,rule.pv);
                        break;
                    case 'flow':
                        compareValue = this.context().flow.get(rule.pv);
                        break;
                    case 'global':
                        compareValue = this.context().global.get(rule.pv);
                        break;
                    case 'env':
                        compareValue = process.env[rule.pv];
                        break;
                    default:
                        return;
                }

                if (utils.compare[rule.op](compareValue,rule.cv,ruleMatch)) {
                    if (rule.op != 'always') { ruleMatch++; };
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

            node.oldState = node.state;
            node.state = state;

            // set topic & id
            msg.topic = node.topic ? node.topic : msg.topic;

            // Store msg.payload
            node.payload = msg.payload;
                        
            showState(node,node.state);
            
            node.events.event(node.id,node);
            node.events.event('0',node);

            if (node.output === true) {
                if (node.outputType == 'state') {
                    var payload = node.state;
                } else {
                    var payload = RED.util.getMessageProperty(msg,node.outputValue);
                }
                if (node.outputOnChange) {
                    if (node.outputPayload == payload) {
                        return
                    } else {
                        node.outputPayload = payload;
                    }
                }
                msg.payload = payload;
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("item",halItem);
}