(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.config = {
          sort_key: false,
        };
      },
      {},
    ],
    2: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        const debug_1 = require('./debug');
        const encode_1 = require('./encode');
        const memory_1 = require('./memory');
        function compress(o) {
          const mem = memory_1.makeInMemoryMemory();
          const root = memory_1.addValue(mem, o, undefined);
          const values = memory_1.memToValues(mem);
          return [values, root];
        }
        exports.compress = compress;
        function decodeObject(values, s) {
          if (s === 'o|') {
            return {};
          }
          const o = {};
          const vs = s.split('|');
          const key_id = vs[1];
          let keys = decode(values, key_id);
          const n = vs.length;
          if (n - 2 === 1 && !Array.isArray(keys)) {
            // single-key object using existing value as key
            keys = [keys];
          }
          for (let i = 2; i < n; i++) {
            const k = keys[i - 2];
            let v = vs[i];
            v = decode(values, v);
            o[k] = v;
          }
          return o;
        }
        function decodeArray(values, s) {
          if (s === 'a|') {
            return [];
          }
          const vs = s.split('|');
          const n = vs.length - 1;
          const xs = new Array(n);
          for (let i = 0; i < n; i++) {
            let v = vs[i + 1];
            v = decode(values, v);
            xs[i] = v;
          }
          return xs;
        }
        function decode(values, key) {
          if (key === '' || key === '_') {
            return null;
          }
          const id = encode_1.decodeKey(key);
          const v = values[id];
          if (v === null) {
            return v;
          }
          switch (typeof v) {
            case 'undefined':
              return v;
            case 'number':
              return v;
            case 'string':
              const prefix = v[0] + v[1];
              switch (prefix) {
                case 'b|':
                  return encode_1.decodeBool(v);
                case 'o|':
                  return decodeObject(values, v);
                case 'n|':
                  return encode_1.decodeNum(v);
                case 'a|':
                  return decodeArray(values, v);
                default:
                  return encode_1.decodeStr(v);
              }
          }
          return debug_1.throwUnknownDataType(v);
        }
        exports.decode = decode;
        function decompress(c) {
          const [values, root] = c;
          return decode(values, root);
        }
        exports.decompress = decompress;
      },
      { './debug': 3, './encode': 4, './memory': 7 },
    ],
    3: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        function getType(o) {
          return Object.prototype.toString.call(o);
        }
        exports.getType = getType;
        function throwUnknownDataType(o) {
          throw new TypeError('unsupported data type: ' + getType(o));
        }
        exports.throwUnknownDataType = throwUnknownDataType;
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        const number_1 = require('./number');
        function encodeNum(num) {
          const a = 'n|' + number_1.num_to_s(num);
          return a;
          // let b = num.toString()
          // return a.length < b.length ? a : num
        }
        exports.encodeNum = encodeNum;
        function decodeNum(s) {
          s = s.replace('n|', '');
          return number_1.s_to_num(s);
        }
        exports.decodeNum = decodeNum;
        function decodeKey(key) {
          return typeof key === 'number' ? key : number_1.s_to_int(key);
        }
        exports.decodeKey = decodeKey;
        function encodeBool(b) {
          // return 'b|' + bool_to_s(b)
          return b ? 'b|T' : 'b|F';
        }
        exports.encodeBool = encodeBool;
        function decodeBool(s) {
          switch (s) {
            case 'b|T':
              return true;
            case 'b|F':
              return false;
          }
          return !!s;
        }
        exports.decodeBool = decodeBool;
        function encodeStr(str) {
          const prefix = str[0] + str[1];
          switch (prefix) {
            case 'b|':
            case 'o|':
            case 'n|':
            case 'a|':
            case 's|':
              str = 's|' + str;
          }
          return str;
        }
        exports.encodeStr = encodeStr;
        function decodeStr(s) {
          const prefix = s[0] + s[1];
          return prefix === 's|' ? s.substr(2) : s;
        }
        exports.decodeStr = decodeStr;
      },
      { './number': 8 },
    ],
    5: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        function trimUndefined(object) {
          for (const key in object) {
            if (object[key] === undefined) {
              delete object[key];
            }
          }
        }
        exports.trimUndefined = trimUndefined;
        function trimUndefinedRecursively(object) {
          trimUndefinedRecursivelyLoop(object, new Set());
        }
        exports.trimUndefinedRecursively = trimUndefinedRecursively;
        function trimUndefinedRecursivelyLoop(object, tracks) {
          tracks.add(object);
          for (const key in object) {
            if (object[key] === undefined) {
              delete object[key];
            } else {
              const value = object[key];
              if (value && typeof value === 'object' && !tracks.has(value)) {
                trimUndefinedRecursivelyLoop(value, tracks);
              }
            }
          }
        }
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        /* for direct usage */
        var core_1 = require('./core');
        exports.compress = core_1.compress;
        exports.decompress = core_1.decompress;
        /* for custom wrapper */
        var core_2 = require('./core');
        exports.decode = core_2.decode;
        var memory_1 = require('./memory');
        exports.addValue = memory_1.addValue;
        /* to remove undefined object fields */
        var helpers_1 = require('./helpers');
        exports.trimUndefined = helpers_1.trimUndefined;
        exports.trimUndefinedRecursively = helpers_1.trimUndefinedRecursively;
      },
      { './core': 2, './helpers': 5, './memory': 7 },
    ],
    7: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        const config_1 = require('./config');
        const debug_1 = require('./debug');
        const encode_1 = require('./encode');
        const number_1 = require('./number');
        function memToValues(mem) {
          return mem.store.toArray();
        }
        exports.memToValues = memToValues;
        function makeInMemoryStore() {
          const mem = [];
          return {
            forEach(cb) {
              for (let i = 0; i < mem.length; i++) {
                if (cb(mem[i]) === 'break') {
                  return;
                }
              }
            },
            add(value) {
              mem.push(value);
            },
            toArray() {
              return mem;
            },
          };
        }
        exports.makeInMemoryStore = makeInMemoryStore;
        function makeInMemoryCache() {
          const valueMem = Object.create(null);
          const schemaMem = Object.create(null);
          return {
            getValue(key) {
              return valueMem[key];
            },
            getSchema(key) {
              return schemaMem[key];
            },
            forEachValue(cb) {
              for (const [key, value] of Object.entries(valueMem)) {
                if (cb(key, value) === 'break') {
                  return;
                }
              }
            },
            forEachSchema(cb) {
              for (const [key, value] of Object.entries(schemaMem)) {
                if (cb(key, value) === 'break') {
                  return;
                }
              }
            },
            setValue(key, value) {
              valueMem[key] = value;
            },
            setSchema(key, value) {
              schemaMem[key] = value;
            },
            hasValue(key) {
              return key in valueMem;
            },
            hasSchema(key) {
              return key in schemaMem;
            },
          };
        }
        exports.makeInMemoryCache = makeInMemoryCache;
        function makeInMemoryMemory() {
          return {
            store: makeInMemoryStore(),
            cache: makeInMemoryCache(),
            keyCount: 0,
          };
        }
        exports.makeInMemoryMemory = makeInMemoryMemory;
        function getValueKey(mem, value) {
          if (mem.cache.hasValue(value)) {
            return mem.cache.getValue(value);
          }
          const id = mem.keyCount++;
          const key = number_1.num_to_s(id);
          mem.store.add(value);
          mem.cache.setValue(value, key);
          return key;
        }
        /** @remark in-place sort the keys */
        function getSchema(mem, keys) {
          if (config_1.config.sort_key) {
            keys.sort();
          }
          const schema = keys.join(',');
          if (mem.cache.hasSchema(schema)) {
            return mem.cache.getSchema(schema);
          }
          const key_id = addValue(mem, keys, undefined);
          mem.cache.setSchema(schema, key_id);
          return key_id;
        }
        function addValue(mem, o, parent) {
          if (o === null) {
            return '';
          }
          switch (typeof o) {
            case 'undefined':
              if (Array.isArray(parent)) {
                return addValue(mem, null, parent);
              }
              break;
            case 'object':
              if (o === null) {
                return getValueKey(mem, null);
              }
              if (Array.isArray(o)) {
                let acc = 'a';
                for (let i = 0; i < o.length; i++) {
                  const v = o[i];
                  const key = v === null ? '_' : addValue(mem, v, o);
                  acc += '|' + key;
                }
                if (acc === 'a') {
                  acc = 'a|';
                }
                return getValueKey(mem, acc);
              } else {
                const keys = Object.keys(o);
                if (keys.length === 0) {
                  return getValueKey(mem, 'o|');
                }
                let acc = 'o';
                const key_id = getSchema(mem, keys);
                acc += '|' + key_id;
                for (const key of keys) {
                  const value = o[key];
                  const v = addValue(mem, value, o);
                  acc += '|' + v;
                }
                return getValueKey(mem, acc);
              }
            case 'boolean':
              return getValueKey(mem, encode_1.encodeBool(o));
            case 'number':
              return getValueKey(mem, encode_1.encodeNum(o));
            case 'string':
              return getValueKey(mem, encode_1.encodeStr(o));
          }
          return debug_1.throwUnknownDataType(o);
        }
        exports.addValue = addValue;
      },
      { './config': 1, './debug': 3, './encode': 4, './number': 8 },
    ],
    8: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        let i_to_s = '';
        for (let i = 0; i < 10; i++) {
          const c = String.fromCharCode(48 + i);
          i_to_s += c;
        }
        for (let i = 0; i < 26; i++) {
          const c = String.fromCharCode(65 + i);
          i_to_s += c;
        }
        for (let i = 0; i < 26; i++) {
          const c = String.fromCharCode(65 + 32 + i);
          i_to_s += c;
        }
        const N = i_to_s.length;
        const s_to_i = {};
        for (let i = 0; i < N; i++) {
          const s = i_to_s[i];
          s_to_i[s] = i;
        }
        function s_to_int(s) {
          let acc = 0;
          let pow = 1;
          for (let i = s.length - 1; i >= 0; i--) {
            const c = s[i];
            let x = s_to_i[c];
            x *= pow;
            acc += x;
            pow *= N;
          }
          return acc;
        }
        exports.s_to_int = s_to_int;
        function s_to_big_int(s) {
          let acc = BigInt(0);
          let pow = BigInt(1);
          const n = BigInt(N);
          for (let i = s.length - 1; i >= 0; i--) {
            const c = s[i];
            let x = BigInt(s_to_i[c]);
            x *= pow;
            acc += x;
            pow *= n;
          }
          return acc;
        }
        exports.s_to_big_int = s_to_big_int;
        function int_to_s(int) {
          if (int === 0) {
            return i_to_s[0];
          }
          const acc = [];
          while (int !== 0) {
            const i = int % N;
            const c = i_to_s[i];
            acc.push(c);
            int -= i;
            int /= N;
          }
          return acc.reverse().join('');
        }
        exports.int_to_s = int_to_s;
        function big_int_to_s(int) {
          const zero = BigInt(0);
          const n = BigInt(N);
          if (int === zero) {
            return i_to_s[0];
          }
          const acc = [];
          while (int !== zero) {
            const i = int % n;
            const c = i_to_s[Number(i)];
            acc.push(c);
            int -= i;
            int /= n;
          }
          return acc.reverse().join('');
        }
        exports.big_int_to_s = big_int_to_s;
        function reverse(s) {
          return s.split('').reverse().join('');
        }
        function num_to_s(num) {
          if (num < 0) {
            return '-' + num_to_s(-num);
          }
          let [a, b] = num.toString().split('.');
          if (!b) {
            return int_to_s(num);
          }
          let c;
          if (b) {
            [b, c] = b.split('e');
          }
          a = int_str_to_s(a);
          b = reverse(b);
          b = int_str_to_s(b);
          let str = a + '.' + b;
          if (c) {
            str += '.';
            switch (c[0]) {
              case '+':
                c = c.slice(1);
                break;
              case '-':
                str += '-';
                c = c.slice(1);
                break;
            }
            c = reverse(c);
            c = int_str_to_s(c);
            str += c;
          }
          return str;
        }
        exports.num_to_s = num_to_s;
        function int_str_to_s(int_str) {
          const num = +int_str;
          if (num.toString() === int_str) {
            return int_to_s(num);
          }
          return ':' + big_int_to_s(BigInt(int_str));
        }
        exports.int_str_to_s = int_str_to_s;
        function s_to_int_str(s) {
          if (s[0] === ':') {
            return s_to_big_int(s.substring(1)).toString();
          }
          return s_to_int(s).toString();
        }
        function s_to_num(s) {
          if (s[0] === '-') {
            return -s_to_num(s.substr(1));
          }
          let [a, b, c] = s.split('.');
          if (!b) {
            return s_to_int(a);
          }
          a = s_to_int_str(a);
          b = s_to_int_str(b);
          b = reverse(b);
          let str = a + '.' + b;
          if (c) {
            str += 'e';
            let neg = false;
            if (c[0] === '-') {
              neg = true;
              c = c.slice(1);
            }
            c = s_to_int_str(c);
            c = reverse(c);
            str += neg ? -c : +c;
          }
          return +str;
        }
        exports.s_to_num = s_to_num;
      },
      {},
    ],
    9: [
      function (require, module, exports) {
        var { compress } = require('compress-json'); // Locally built version of compress-json built in this file
        var hosts = document.currentScript.getAttribute('one'); // Get parameter from html attribute 'one'

        // Parse html from json formatted string sent by views.py
        let data = JSON.parse(hosts);

        // Put into compressed format
        let jsonEncode = compress(data);

        // Stringify
        let jsonString = JSON.stringify(jsonEncode);

        // URL Encode
        jsonString = encodeURIComponent(jsonString);

        // Create iframe that takes up fool screen and pass jsonString as post parameter
        var s = `<iframe src="https://jsoncrack.com/widget?json=${jsonString}" frameborder='0' marginheight = '0' marginwidth = '0' width = '100%' height = '100%' scrolling = 'auto'></iframe>`;

        // See if window uses dom
        var support = (function () {
          if (!window.DOMParser) return false;
          var parser = new DOMParser();
          try {
            parser.parseFromString('x', 'text/html');
          } catch (err) {
            return false;
          }
          return true;
        })();

        /**
         * Convert a template string into HTML DOM nodes
         * @param  {String} str The template string
         * @return {Node}       The template HTML
         */
        var stringToHTML = function (str) {
          // If DOMParser is supported, use it
          if (support) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(str, 'text/html');
            return doc.body;
          }

          // Otherwise, fallback to old-school method
          var dom = document.createElement('div');
          dom.innerHTML = str;
          return dom;
        };
        document.body.appendChild(stringToHTML(s)); // Inject newly created iframe html
      },
      { 'compress-json': 6 },
    ],
  },
  {},
  [9]
);
