//a=state, b=compare value, c=oldState/ruleMatch
var compare = {
    'always':   function ()         {return true;},
    'change':   function (a,b,c)    {return a !== c},
    'otherwise':function (a,b,c)    { return c === 0 },
    'eq':       function (a, b)     { return a === b; },
    'neq':      function (a, b)     { return a !== b; },
    'lt':       function (a, b)     { return ((typeof a == 'number') && (a < b)); },
    'lte':      function (a, b)     { return ((typeof a == 'number') && (a <= b)); },
    'gt':       function (a, b)     { return ((typeof a == 'number') && (a > b)); },
    'gte':      function (a, b)     { return ((typeof a == 'number') && (a >= b)); },
    'cont':     function (a, b)     { return (a + "").indexOf(b) !== -1; },
    'regex':    function (a, b)     { return b.test(a+""); },
    'true':     function (a)        { return a === true; },
    'false':    function (a)        { return a === false; }
};

var checkType ={
    'num':  function (a) { return (typeof a == 'number'); },
    'str':  function (a) { return (typeof a == 'string'); },
    'bool': function (a) { return (typeof a == 'boolean'); },
    'json': function (a) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
     },
    're':   function (a) { return (typeof a == 'string'); }

}

var convertTo = {
    'num':      function (value)    { return Number(value); },
    'str':      function (value)    { return value+""; },
    'bool':     function (value)    { return (value === 'true'); },
    'json':     function (value)    { return JSON.parse(value); },
    're':       function (value)    { return new RegExp(value) }
};

module.exports = {
    compare: compare,
    convertTo: convertTo
}