(function (root) {
  'use strict';

  var HAL = '\u0DCA';
  var ZWJ = '\u200D';
  var AN = '\u0D82';
  var VIS = '\u0D83';
  var NGA = '\u0D9E';

  var VOW = { a: '\u0D85', A: '\u0D87', i: '\u0D89', u: '\u0D8B', R: '\u0D8D', e: '\u0D91', o: '\u0D94' };

  var BASE = {
    k: '\u0D9A', g: '\u0D9C', c: '\u0DA0', j: '\u0DA2', t: '\u0DA7', d: '\u0DA9',
    q: '\u0DAF', n: '\u0DB1', N: '\u0DAB', p: '\u0DB4', b: '\u0DB6', m: '\u0DB8',
    y: '\u0DBA', r: '\u0DBB', l: '\u0DBD', L: '\u0DC5', w: '\u0DC0', v: '\u0DC0',
    s: '\u0DC3', S: '\u0DC2', h: '\u0DC4', f: '\u0DC6', T: '\u0DA8', D: '\u0DAA',
    B: '\u0DB9'
  };

  var ASP = {
    '\u0D9A': '\u0D9B',
    '\u0D9C': '\u0D9D',
    '\u0DA0': '\u0DA1',
    '\u0DA2': '\u0DA3',
    '\u0DA7': '\u0DAD',
    '\u0DA9': '\u0DAF',
    '\u0DAD': '\u0DAE',
    '\u0DAF': '\u0DB0',
    '\u0DAC': '\u0DB3',
    '\u0DB4': '\u0DB5',
    '\u0DB6': '\u0DB7',
    '\u0DAA': '\u0DB0',
    '\u0DC3': '\u0DC1'
  };

  var ZNAS = { g: '\u0D9F', j: '\u0DA6', d: '\u0DAC', k: '\u0DA4', h: '\u0DA5', q: '\u0DB3' };

  var PILI = { a: '', A: '\u0DD0', i: '\u0DD2', u: '\u0DD4', e: '\u0DD9', o: '\u0DDC', R: '\u0DD8' };
  var VOWELS = 'aAiueoR';

  var CSET = {};
  Object.keys(BASE).forEach(function (k) { CSET[BASE[k]] = 1; });
  Object.keys(ASP).forEach(function (k) { CSET[ASP[k]] = 1; });
  Object.keys(ZNAS).forEach(function (k) { CSET[ZNAS[k]] = 1; });
  CSET[NGA] = 1;

  function isC(c) { return !!CSET[c]; }
  function isZ(t) { return typeof t === 'object' && t !== null && t.z === 1; }
  function isH(t) { return typeof t === 'object' && t !== null && t.h === 1; }
  function last(b) { return b[b.length - 1]; }
  function se(b, n) { return b[b.length - n]; }
  function rep(b, n, items) {
    for (var i = 0; i < n; i++) b.pop();
    for (var j = 0; j < items.length; j++) b.push(items[j]);
  }

  var RULES = [];
  function add(match, ap) { RULES.push({ match: match, ap: ap }); }

  add(function (b, k) { return (k === 'z' || k === 'G') && isZ(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [{ z: 1 }]); });
  add(function (b, k) { return (k === 'z' || k === 'G') ? 0 : -1; },
    function (b) { b.push({ z: 1 }); });

  add(function (b, k) { return k === 'h' && isH(last(b)) && se(b, 2) === HAL && isC(se(b, 3)) ? 3 : -1; },
    function (b) { var c = se(b, 3); rep(b, 3, [ASP[c], HAL]); });

  add(function (b, k) { return k === 'n' && isZ(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [AN]); });

  Object.keys(ZNAS).forEach(function (key) {
    add(function (b, k) { return k === key && isZ(last(b)) ? 1 : -1; },
      function (b, k) { rep(b, 1, [ZNAS[k], HAL]); });
  });
  add(function (b, k) { return !!BASE[k] && isZ(last(b)) ? 1 : -1; },
    function (b, k) { rep(b, 1, [BASE[k], HAL]); });
  add(function (b, k) { return !!BASE[k] && isH(last(b)) ? 1 : -1; },
    function (b, k) { rep(b, 1, [BASE[k], HAL]); });

  add(function (b, k) { return k === 'h' && last(b) === HAL && isC(se(b, 2)) && !!ASP[se(b, 2)] && se(b, 2) !== '\u0DA0' ? 2 : -1; },
    function (b) { var c = se(b, 2); rep(b, 2, [ASP[c], HAL]); });
  add(function (b, k) { return k === 'h' && last(b) === HAL && se(b, 2) === '\u0DA0' ? 2 : -1; },
    function (b) { b.push({ h: 1 }); });
  add(function (b, k) { return k === 'h' && last(b) === HAL && se(b, 2) === '\u0DC2' ? 2 : -1; },
    function (b) { var c = se(b, 2); rep(b, 2, [c, HAL]); });
  add(function (b, k) { return k === 'h' ? 0 : -1; },
    function (b) { b.push(BASE.h, HAL); });

  for (var vi = 0; vi < VOWELS.length; vi++) {
    (function (v) {
      add(function (b, k) { return k === v && isH(last(b)) && se(b, 2) === HAL && isC(se(b, 3)) ? 3 : -1; },
        function (b, k) { var c = se(b, 3); var p = PILI[k]; rep(b, 3, p ? [c, p] : [c]); });
    })(VOWELS.charAt(vi));
  }

  add(function (b, k) { return k === 'u' && last(b) === HAL && se(b, 2) === '\u0DBB' && se(b, 3) === ZWJ && se(b, 4) === HAL && isC(se(b, 5)) ? 5 : -1; },
    function (b) { var c = se(b, 5); rep(b, 5, [c, '\u0DD8']); });
  add(function (b, k) { return k === 'u' && last(b) === HAL && se(b, 2) === '\u0DBB' && se(b, 3) === HAL && isC(se(b, 4)) ? 4 : -1; },
    function (b) { var c = se(b, 4); rep(b, 4, [c, '\u0DD8']); });

  for (var vi2 = 0; vi2 < VOWELS.length; vi2++) {
    (function (v) {
      add(function (b, k) { return k === v && last(b) === HAL && isC(se(b, 2)) ? 2 : -1; },
        function (b, k) { var c = se(b, 2); var p = PILI[k]; rep(b, 2, p ? [c, p] : [c]); });
    })(VOWELS.charAt(vi2));
  }

  add(function (b, k) { return (k === 'a' || k === 'A') && last(b) === '\u0DD0' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DD1']); });
  add(function (b, k) { return k === 'i' && last(b) === '\u0DD2' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DD3']); });
  add(function (b, k) { return k === 'u' && last(b) === '\u0DD4' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DD6']); });
  add(function (b, k) { return (k === 'u' || k === 'R') && last(b) === '\u0DD8' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DF2']); });
  add(function (b, k) { return k === 'e' && last(b) === '\u0DD9' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DDA']); });
  add(function (b, k) { return k === 'o' && last(b) === '\u0DDC' ? 1 : -1; },
    function (b) { rep(b, 1, ['\u0DDD']); });

  add(function (b, k) { return k === 'a' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DCF']); });
  add(function (b, k) { return k === 'A' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DD0']); });
  add(function (b, k) { return k === 'i' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DDB']); });
  add(function (b, k) { return k === 'u' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DDE']); });
  add(function (b, k) { return k === 'e' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DD9']); });
  add(function (b, k) { return k === 'o' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DDC']); });
  add(function (b, k) { return k === 'R' && isC(last(b)) ? 1 : -1; },
    function (b) { rep(b, 1, [last(b), '\u0DD8']); });

  add(function (b, k) { return k === 'a' && last(b) === '\u0D85' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D86']); });
  add(function (b, k) { return k === 'a' && last(b) === '\u0D87' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D88']); });
  add(function (b, k) { return k === 'A' && last(b) === '\u0D85' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D87']); });
  add(function (b, k) { return k === 'A' && last(b) === '\u0D87' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D88']); });
  add(function (b, k) { return k === 'i' && last(b) === '\u0D89' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D8A']); });
  add(function (b, k) { return k === 'i' && last(b) === '\u0D85' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D93']); });
  add(function (b, k) { return k === 'u' && last(b) === '\u0D8B' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D8C']); });
  add(function (b, k) { return k === 'u' && last(b) === '\u0D85' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D96']); });
  add(function (b, k) { return k === 'u' && last(b) === '\u0D94' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D96']); });
  add(function (b, k) { return k === 'u' && last(b) === '\u0D8D' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D8E']); });
  add(function (b, k) { return k === 'R' && last(b) === '\u0D8D' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D8E']); });
  add(function (b, k) { return k === 'e' && last(b) === '\u0D91' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D92']); });
  add(function (b, k) { return k === 'o' && last(b) === '\u0D94' ? 1 : -1; }, function (b) { rep(b, 1, ['\u0D95']); });

  for (var vi3 = 0; vi3 < VOWELS.length; vi3++) {
    (function (v) {
      add(function (b, k) { return k === v ? 0 : -1; },
        function (b, k) { b.push(VOW[k]); });
    })(VOWELS.charAt(vi3));
  }

  add(function (b, k) { return (k === 'r' || k === 'y') && last(b) === HAL && isC(se(b, 2)) ? 0 : -1; },
    function (b, k) { b.push(ZWJ, BASE[k], HAL); });
  add(function (b, k) { return !!BASE[k] ? 0 : -1; },
    function (b, k) { b.push(BASE[k], HAL); });

  add(function (b, k) { return k === 'x' ? 0 : -1; }, function (b) { b.push(AN); });
  add(function (b, k) { return k === 'H' ? 0 : -1; }, function (b) { b.push(VIS); });
  add(function (b, k) { return k === 'X' ? 0 : -1; }, function (b) { b.push(NGA); });

  function processChar(buf, key) {
    var best = null;
    for (var i = 0; i < RULES.length; i++) {
      var len = RULES[i].match(buf, key);
      if (len >= 0 && (best === null || len > best.len)) best = { len: len, ap: RULES[i].ap };
    }
    if (best) best.ap(buf, key);
    else buf.push(key);
  }

  function convert(text) {
    var buf = [];
    for (var i = 0; i < text.length; i++) processChar(buf, text.charAt(i));
    var out = '';
    for (var j = 0; j < buf.length; j++) if (typeof buf[j] === 'string') out += buf[j];
    return out;
  }

  var api = { convert: convert };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SinglishConverter = api;
})(typeof window !== 'undefined' ? window : this);
