(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.emojicrypt = factory());
}(this, (function () { 'use strict';

  var browser = true;

  const isBrowser = browser;


  function encode (str) {
    return isBrowser ? btoa(str) : Buffer.from(str).toString('base64')
  }

  function decode (str) {
    return isBrowser ? atob(str) : Buffer.from(str, 'base64').toString()
  }

  const ZWSP = unescape('%u200b');
  const ZWNJ = unescape('%u200c');
  const ZWJ = unescape('%u200d');

  const map = [ ZWNJ, ZWSP ];

  var viscomp = {
    ZWSP, ZWNJ, ZWJ,
    map,
    compress (c) {
      const binary = c.toString(2);

      return binary.replace(/./g, bit => map[bit])
    },
    decompress (str) {
      let binary = '';
      for (const char of str) {
        binary += map.indexOf(char);
      }

      return String.fromCharCode(parseInt(binary, 2))
    }
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var ifEmoji = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    module.exports = factory();
  }(commonjsGlobal, (function () {
  var _ArrayLikeToString = function _ArrayLikeToString(arg) {
    return Array.prototype.toString.call(arg);
  };

  var getTextFeature = function getTextFeature(text, color) {
    try {
      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      var ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '100px -no-font-family-here-';
      ctx.fillStyle = color;
      ctx.scale(0.01, 0.01);
      ctx.fillText(text, 0, 0);

      return ctx.getImageData(0, 0, 1, 1).data;
    } catch (e) {
      return false;
    }
  };

  var compareFeatures = function compareFeatures(feature1, feature2) {
    var feature1Str = _ArrayLikeToString(feature1);
    var feature2Str = _ArrayLikeToString(feature2);
    return feature1Str === feature2Str && feature1Str !== '0,0,0,0';
  };

  var index = function (text) {
    var feature1 = getTextFeature(text, '#000');
    var feature2 = getTextFeature(text, '#fff');
    return feature1 && feature2 && compareFeatures(feature1, feature2);
  };

  return index;

  })));
  });

  const table = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍",
    "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄",
    "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝",
    "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖", "😞", "😟", "😤",
    "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "😳", "🤪", "😵",
    "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🤠", "🤡", "🤥",
    "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "💩",
    "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🤲", "👐", "🙌", "👏",
    "🤝", "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "🤟", "🤘", "👌", "👈", "👉",
    "👆", "👇", "✋", "🤚", "🖖", "👋", "🤙", "🖕", "🦊", "🐼", "🐺", "🐗", "🦄",
    "💎", "🧡", "💛", "💚", "💙", "💜",
  ].filter(ifEmoji);

  const ZWNJ$1 = viscomp.ZWNJ;
  viscomp.map[0] = viscomp.ZWJ;

  const emojicrypt = {
    encrypt (str = '', startIndex = 0, visualCompression = false) {
      if (typeof str === 'object') str = JSON.stringify(str);
      const base = encode(str.toString().replace(/[^\0-~]/g, ch => "%u" + ("000" + ch.charCodeAt().toString(16)).slice(-4) ));
      if (startIndex < 0) {
        startIndex = 0;
      }

      if (startIndex >= table.length) {
        startIndex = table.length - 1;
      }

      if (!startIndex) {
        startIndex = Math.floor(Math.random() * table.length);
      }

      startIndex ^= 0;
      let res = table[startIndex] + ZWNJ$1;

      if (visualCompression !== false) {
        visualCompression -= 1;

        if (visualCompression < 1) {
          visualCompression = 1;
        }

        visualCompression ^= 0;

        const start = base.slice(0, -visualCompression);
        const end = base.slice(base.length - visualCompression, base.length);

        return res + start.replace(/./g, c => {
          return viscomp.compress(c.charCodeAt(0)) + ZWNJ$1
        }) + end.replace(/./g, c  => {
          let i = c.charCodeAt(0) - 43 + startIndex;
          if (i >= table.length) i -= table.length;

          const res = table[i];
          return (res ? res : i) + ZWNJ$1
        }).slice(0, -1)
      }

      return res + base.replace(/./g, c  => {
        let i = c.charCodeAt(0) - 43 + startIndex;
        if (i >= table.length) i -= table.length;

        const res = table[i];
        return (res ? res : i) + ZWNJ$1
      }).slice(0, -1)
    },
    decrypt (str = '💩', debug = false) {
      const emojis = str.split(ZWNJ$1);
      const start = emojis.shift();
      let startIndex = table.indexOf(start);

      if (startIndex === -1) {
        startIndex = viscomp.decompress(start);
      }

      if (debug) {
        console.debug(`Start index: ${startIndex} (${start})`);
      }

      const base = emojis.map(e => {
        if (viscomp.map.includes(e[0])) {
          const char = viscomp.decompress(e);

          if (debug) {
            console.debug(`Changing ${e.split('').map(c => viscomp.map.indexOf(c)).join('')} -> ${char}}`);
          }

          return char
        }

        let i = table.indexOf(e) + 43 - startIndex;
        if (i < 43) i += table.length;

        if (debug) {
          console.debug(`Changing ${e} -> ${i} -> ${String.fromCharCode(i)}`);
        }

        return String.fromCharCode(i)
      }).join('');


      if (debug) {
        console.debug(`Base64: ${base}`);
      }

      const res = unescape(decode(base));
      if (debug) {
        console.debug(`Decoded: ${res}`);
      }
      try {
        return JSON.parse(res)
      } catch (e) {
        return res
      }
    },
    _test (compression = false) {
      let pass = true;
      for (let i = 0; i < 10000; ++i) {
      	const str = Math.random() + '';
        const enc = emojicrypt.encrypt(str, undefined, compression);
        try {
          const dec = emojicrypt.decrypt(enc);
          if (dec != str) {
            throw new Error('src/dec mismatch: ' + str + ' / ' + dec)
          }
        } catch (e) {
          console.error(i + ': ' + enc);
          console.error(e);
          try {
            emojicrypt.decrypt(enc, true);
          } catch (e) {}
          pass = false;
          break;
        }
      }

      return pass
    }

  };

  return emojicrypt;

})));
