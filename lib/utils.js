//a=state, b=compare value, c=oldState/ruleMatch
var compare = {
    'always':   function()          {return true;},
    'change':   function (a,b,c)    {return a !== c},
    'otherwise':function (a,b,c)    { return c == 0 },
    'eq':       function (a, b)     { return a === b; },
    'neq':      function (a, b)     { return a !== b; },
    'lt':       function (a, b)     { return a < b; },
    'lte':      function (a, b)     { return a <= b; },
    'gt':       function (a, b)     { return a > b; },
    'gte':      function (a, b)     { return a >= b; },
    'cont':     function (a, b)     { return (a + "").indexOf(b) !== -1; },
    'regex':    function (a, b)     { return b.test(a+""); },
    'true':     function (a)        { return a === true; },
    'false':    function (a)        { return a === false; }
};

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