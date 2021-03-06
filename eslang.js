/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./web/lib/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./es/compiler.js":
/*!************************!*\
  !*** ./es/compiler.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function compilerIn ($void) {
  var $ = $void.$
  var Tuple$ = $void.Tuple
  var warn = $void.$warn
  var $export = $void.export
  var tokenizer = $.tokenizer
  var isApplicable = $void.isApplicable
  var formatPattern = $void.formatPattern
  var sharedSymbolOf = $void.sharedSymbolOf

  var symbolPairing = $.symbol.pairing
  var symbolSubject = $.symbol.subject
  var symbolString = sharedSymbolOf('string')
  var symbolFormat = sharedSymbolOf('format')
  var symbolToString = sharedSymbolOf('to-string')

  var makeSourceUri = function (uri, version) {
    return !uri || typeof uri !== 'string' ? ''
      : !version || typeof version !== 'string' ? uri
        : uri + '@' + version
  }

  var compiler = $export($, 'compiler', function (evaluate, srcUri) {
    if (!isApplicable(evaluate)) {
      return $.compile
    }

    var srcText = ''
    if (!srcUri || typeof srcUri !== 'string') {
      srcUri = ''
    }

    var stack, sourceStack, waiter, lastToken, openingLine, openingOffset
    resetContext()

    function resetContext () {
      stack = [[]]
      sourceStack = [[[[0, 0, 0]]]]
      waiter = null
      lastToken = ['space', '', [0, 0, 0]]
      openingLine = -1
      openingOffset = 0
    }

    var tokenizing = tokenizer(compileToken, srcUri)
    return function compiling (text) {
      srcText = text && typeof text === 'string' ? text : ''
      if (tokenizing(text)) {
        return stack.length
      }
      // reset compiling context.
      waiter && waiter()
      if (stack.length > 1) {
        warn('compiler', 'open statements are not properly closed.',
          [lastToken, srcUri || srcText])
        endAll(null, lastToken[2])
      }
      tryToRaise()
      resetContext()
      return 0
    }

    function compileToken (type, value, source) {
      var endingLine = source[source.length - 2]
      if (endingLine !== openingLine) {
        openingLine = endingLine
        openingOffset = stack[stack.length - 1].length
      }
      if (!waiter || !waiter(type, value, source)) {
        parseToken(type, value, source)
      }
      lastToken = [type, value, source]
    }

    function parseToken (type, value, source) {
      switch (type) {
        case 'value':
          pushValue(value, source)
          break
        case 'symbol':
          pushSymbol(value, source)
          break
        case 'punctuation':
          pushPunctuation(value, source)
          break
        case 'format':
          pushFormat(value, source)
          break
        case 'space':
          if (value === '\n') {
            tryToRaise()
          }
          break
        case 'comment':
          // comment document should be put in specs.
          break
        default:
          // do nothing for a free space.
          break
      }
    }

    function tryToRaise () {
      while (stack[0].length > 0) {
        evaluate([stack[0].shift(), sourceStack[0].splice(0, 1)])
      }
    }

    function pushValue (value, source) {
      stack[stack.length - 1].push(value)
      sourceStack[sourceStack.length - 1].push(source)
    }

    function pushSymbol (value, source) {
      switch (value.key) {
        case ',':
          // a free comma functions only as a stronger visual indicator like
          // a whitespace, so it will be just skipped in building AST.
          if (lastToken[0] === 'symbol' && lastToken[1].key === ',') {
            pushValue(null, source)
          }
          break
        case ';':
          endLine(value, source)
          if (!crossingLines()) {
            closeLine(value, source)
          }
          break
        default:
          pushValue(value, source)
      }
    }

    function pushPunctuation (value, source) {
      switch (value) {
        case '(': // begin a new clause
          stack.push([])
          sourceStack.push([[source]])
          break
        case ')':
          // wait for next token to decide
          waiter = endingWaiter
          break
        default: // just skip unknown punctuation as some placeholders.
          break
      }
    }

    function pushFormat (pattern, source) {
      var args = formatPattern(pattern)
      if (!(args.length > 1)) {
        if (pattern.indexOf('"') < 0) {
          warn('compiler', 'unnecessary format string.',
            pattern, ['format', pattern, source, srcUri || srcText])
        }
        return pushValue(args[0], source)
      }

      var beginning = source.slice(0, 3).concat(source.slice(1, 2))
      var ending = source.slice(0, 1).concat(source.slice(-2))
      stack.push([symbolString, symbolFormat])
      sourceStack.push([[beginning], beginning, beginning])

      pushValue(args[0], source)
      for (var i = 1; i < args.length; i++) {
        var code = $.compile(args[i])
        pushValue(code.$.length > 0 ? code.$[0] : null, ending)
      }
      endTopWith(ending)
    }

    function endingWaiter (type, value, source) {
      waiter = null // wait only once.
      if (type !== 'symbol') {
        endClause()
        return false // stop waiting
      }
      switch (value.key) {
        case '.':
          if (stack.length > 1) {
            endMatched(value, source)
          } else {
            warn('compiler', 'extra enclosing ")." is found and ignored.',
              [lastToken, ['symbol', value, source], srcUri || srcText])
          }
          return true
        default:
          endClause()
          return false
      }
    }

    function endTopWith (source) {
      // create a tuple for the top clause, and
      var statement = stack.pop()
      // append ending token(s)' source info.
      var sourceMap = sourceStack.pop()
      sourceMap[0].push(source || lastToken[2])
      while (statement.length > 2 &&
        tryToFoldStatement(statement, sourceMap)
      );
      // push it to the end of container clause.
      sourceMap[0].unshift(srcUri || srcText)
      stack[stack.length - 1].push(new Tuple$(statement, false, sourceMap))
      // since the source has been saved into the tuple, only keeps its overall range.
      sourceStack[sourceStack.length - 1].push(sourceMap[0].slice(1))
    }

    function tryToFoldStatement (statement, sourceMap) { // sweeter time.
      var max = statement.length - 1
      for (var i = 1; i < max; i++) {
        if (statement[i] === symbolPairing && statement[i + 1] === symbolPairing) {
          statement.splice(i, 2)
          sourceMap.splice(i + 1, 2)
          foldStatement(statement, sourceMap, i)
          return true
        }
      }
      return false
    }

    function foldStatement (statement, sourceMap, length) {
      // (x :: y) => ($(x) y)
      var expr = statement.splice(0, length)
      // re-arrange source map
      var exprSrcMap = sourceMap.splice(1, length + 1)
      var beginning = exprSrcMap[0].slice(0, 3)
      var ending = exprSrcMap[exprSrcMap.length - 1]
      exprSrcMap.unshift(beginning.concat(ending.slice(-2)))

      // (x ::) => ($(x) to-string)
      if (statement.length < 1) {
        statement.push(symbolToString)
        sourceMap.push(ending.slice(0, 1).concat(ending.slice(-2)))
      }

      exprSrcMap[0].unshift(srcUri || srcText)
      statement.unshift(symbolSubject, new Tuple$(expr, false, exprSrcMap))
      sourceMap.splice(1, 0,
        beginning.concat(beginning.slice(1)), exprSrcMap[0].slice(1)
      )
    }

    function endClause () {
      if (stack.length < 2) {
        warn('compiler', 'extra enclosing parentheses is found and ignored.',
          [lastToken, srcUri || srcText])
        return // allow & ignore extra enclosing parentheses
      }
      endTopWith()
    }

    function endMatched (value, source) {
      if (stack.length < 2) {
        warn('compiler', 'extra ")," is found and ignored.',
          [lastToken, ['symbol', value, source], srcUri || srcText])
        return // allow & ignore extra enclosing parentheses
      }
      lastToken[2][0] >= 0 // the indent value of ')'
        ? endIndent(value, source) : endLine(value, source)
    }

    function endLine (value, source) { // sugar time
      var depth = stack.length - 1
      while (depth > 0) {
        var startSource = sourceStack[depth][0][0] // start source.
        if (startSource[1] < source[1]) { // comparing line numbers.
          break
        }
        endTopWith(source)
        depth = stack.length - 1
      }
    }

    function crossingLines () {
      var depth = sourceStack.length - 1
      var srcOffset = openingOffset + 1
      var topSource = sourceStack[depth]
      return topSource.length > srcOffset &&
        openingLine > topSource[srcOffset][1]
    }

    function closeLine (value, source) { // sweeter time.
      var depth = stack.length - 1
      stack.push(stack[depth].splice(openingOffset))
      var src = sourceStack[depth].splice(openingOffset + 1)
      src.length > 0 ? src.unshift(src[0]) : src.push(source)
      sourceStack.push(src)
      endTopWith(source)
      openingOffset = stack[depth].length
    }

    function endIndent (value, source) { // sugar time
      var endingIndent = lastToken[2][0]
      var depth = stack.length - 1
      while (depth > 0) {
        var indent = sourceStack[depth][0][0][0]
        // try to looking for and stop with the first matched indent.
        if (indent >= 0 && indent <= endingIndent) {
          if (indent === endingIndent) {
            endTopWith(source)
          }
          break
        }
        endTopWith(source)
        depth = stack.length - 1
      }
    }

    function endAll (value, source) { // sugar time
      while (stack.length > 1) {
        endTopWith(source)
      }
    }
  })

  // a simple memory cache
  var cache = {
    code: Object.create(null),
    versions: Object.create(null),

    get: function (uri, version) {
      return !uri || typeof uri !== 'string' ? null
        : !version || typeof version !== 'string' ? this.code[uri]
          : this.versions[uri] === version ? this.code[uri] : null
    },
    set: function (code, uri, version) {
      if (uri && typeof uri === 'string') {
        this.code[uri] = code
        if (version && typeof version === 'string') {
          this.versions[uri] = version
        }
      }
      return code
    }
  }

  // a helper function to compile a piece of source code.
  $export($, 'compile', function (text, uri, version) {
    var code = cache.get(uri, version)
    if (code) {
      return code
    }

    var srcUri = makeSourceUri(uri || text, version)
    var list = []
    var src = [[[srcUri, 0, 0, 0]]]
    var compiling = compiler(function collector (expr) {
      list.push(expr[0])
      src.push(expr[1])
    }, srcUri)
    if (compiling(text) > 1) {
      compiling('\n') // end any pending waiter.
    }
    compiling() // notify the end of stream.
    code = new Tuple$(list, true, src)
    return cache.set(code, uri, version)
  })
}


/***/ }),

/***/ "./es/generic/array.js":
/*!*****************************!*\
  !*** ./es/generic/array.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function offsetOf (length, index) {
  index >>= 0
  return index >= 0 ? index : index + length
}

function beginOf (length, from) {
  from = offsetOf(length, from)
  return from < 0 ? 0 : from
}

function endOf (length, to) {
  return typeof to === 'undefined' ? length : beginOf(length, to)
}

function checkSpacing (s, i, last) {
  switch (i - last) {
    case 1: return
    case 2: s.push('*'); return
    case 3: s.push('*', '*'); return
    case 4: s.push('*', '*', '*'); return
    default: s.push('...')
  }
}

module.exports = function arrayIn ($void) {
  var $ = $void.$
  var Type = $.array
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var link = $void.link
  var thisCall = $void.thisCall
  var iterateOf = $void.iterateOf
  var boolValueOf = $void.boolValueOf
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var EncodingContext$ = $void.EncodingContext

  var symbolComma = $Symbol.comma
  var symbolLiteral = $Symbol.literal
  var symbolPairing = $Symbol.pairing

  // create an empty array.
  link(Type, 'empty', function () {
    return []
  }, true)

  // create an array of the arguments
  link(Type, 'of', function (x, y, z) {
    switch (arguments.length) {
      case 0: return []
      case 1: return [x]
      case 2: return [x, y]
      case 3: return [x, y, z]
      default: return Array.prototype.slice.call(arguments)
    }
  }, true)

  // create an array with items from iterable arguments, or the argument itself
  // if its value is not iterable.
  var arrayFrom = link(Type, 'from', function () {
    var list = []
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i]
      if (Array.isArray(source)) {
        list = list.concat(source)
      } else {
        var next = iterateOf(source)
        if (!next) {
          list.push(source)
        } else {
          var item = next()
          while (typeof item !== 'undefined' && item !== null) {
            list.push(Array.isArray(item) ? item.length > 0 ? item[0] : null : item)
            item = next()
          }
        }
      }
    }
    return list
  }, true)

  var proto = Type.proto
  // return the length of this array.
  link(proto, 'length', function () {
    return this.length
  })
  // return the amount of elements.
  link(proto, ['count', 'for-each'], function (filter) {
    var counter = 0
    if (isApplicable(filter)) {
      this.forEach(function (v, i, arr) {
        typeof v !== 'undefined' &&
          boolValueOf(filter.call(arr, v, i)) && counter++
      })
    } else {
      this.forEach(function (v) {
        typeof v !== 'undefined' && counter++
      })
    }
    return counter
  })

  // Mutability
  link(proto, 'seal', function () {
    return Object.freeze(this)
  })
  link(proto, 'is-sealed', function () {
    return Object.isFrozen(this)
  })

  var stopSignal = new Error('tracing.stopped')
  // call a handler for each element until it returns a truthy value.
  var trace = link(proto, 'trace', function (tracer) {
    if (isApplicable(tracer)) {
      try {
        this.forEach(function (v, i, arr) {
          if (typeof v !== 'undefined' && boolValueOf(tracer.call(arr, v, i))) {
            throw stopSignal
          }
        })
      } catch (err) {
        if (err !== stopSignal) throw err
      }
    }
    return this
  })

  // like trace, but to traverse all element from the end.
  var retrace = link(proto, 'retrace', function (tracer) {
    if (isApplicable(tracer)) {
      try {
        this.reduceRight(function (_, v, i, s) {
          if (typeof v !== 'undefined' && boolValueOf(tracer.call(s, v, i))) {
            throw stopSignal
          }
        }, this)
      } catch (err) {
        if (err !== stopSignal) throw err
      }
    }
    return this
  })

  // generate an iterator function to traverse all array items.
  link(proto, 'iterate', function (begin, end) {
    begin = beginOf(this.length, begin)
    end = endOf(this.length, end)
    var list = this
    var indices = []
    trace.call(this, function (_, i) {
      return i >= end || (
        (i >= begin && indices.push(i)) && false
      )
    })
    var current
    begin = 0; end = indices.length
    return function next (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      if (begin >= end) {
        return null
      }
      var index = indices[begin++]
      return (current = [list[index], index])
    }
  })

  // to create a shallow copy of this instance with all items,
  // or selected items in a range.
  link(proto, 'copy', function (begin, count) {
    begin = beginOf(this.length, begin)
    count = typeof count === 'undefined' ? this.length : count >> 0
    if (count < 0) {
      count = 0
    }
    return this.slice(begin, begin + count)
  })
  link(proto, 'slice', function (begin, end) {
    return this.slice(beginOf(this.length, begin), endOf(this.length, end))
  })

  // create a new array with items in this array and argument values.
  link(proto, 'concat', function () {
    return this.concat(Array.prototype.slice.call(arguments))
  })

  // append more items to the end of this array
  var appendFrom = link(proto, ['append', '+='], function () {
    var isSparse
    for (var i = 0; i < arguments.length; i++) {
      var src = arguments[i]
      src = Array.isArray(src) ? src : arrayFrom(src)
      this.push.apply(this, src)
      isSparse = isSparse || src.isSparse
    }
    return this
  })

  // create a new array with items in this array and argument arrays.
  link(proto, ['merge', '+'], function () {
    return appendFrom.apply(this.slice(), arguments)
  })

  // getter by index
  var getter = link(proto, 'get', function (index) {
    index = offsetOf(this.length, index)
    return index >= 0 ? this[index] : null
  })
  // setter by index
  var setter = link(proto, 'set', function (index, value) {
    index = offsetOf(this.length, index)
    return index < 0 ? null
      : (this[index] = typeof value === 'undefined' ? null : value)
  })
  // reset one or more entries by indices
  link(proto, 'reset', function (index) {
    var length = this.length
    for (var i = 0; i < arguments.length; i++) {
      index = offsetOf(length, arguments[i]);
      (index >= 0) && (delete this[index])
    }
    return this
  })

  // remove all entries or some values from this array.
  link(proto, 'clear', function (value) {
    var argc = arguments.length
    if (argc < 1) {
      this.splice(0)
      return this
    }
    var args = Array.prototype.slice.call(arguments)
    retrace.call(this, function (v, i) {
      for (var j = 0; j < argc; j++) {
        if (thisCall(v, 'equals', args[j])) {
          this.splice(i, 1); return
        }
      }
    })
    return this
  })
  // remove one or more values to create a new array.
  link(proto, 'remove', function (value) {
    var argc = arguments.length
    if (argc < 1) {
      return this.slice()
    }
    var args = Array.prototype.slice.call(arguments)
    var result = []
    var removed = 0
    trace.call(this, function (v, i) {
      var keep = true
      for (var j = 0; j < argc; j++) {
        if (thisCall(v, 'equals', args[j])) {
          keep = false; break
        }
      }
      keep ? (result[i - removed] = v) : removed++
    })
    return result
  })

  // replace all occurrences of a value to another value or reset them.
  link(proto, 'replace', function (value, newValue) {
    if (typeof value === 'undefined') {
      return this
    }
    typeof newValue === 'undefined' ? retrace.call(this, function (v, i) {
      thisCall(v, 'equals', value) && delete this[i]
    }) : trace.call(this, function (v, i) {
      thisCall(v, 'equals', value) && (this[i] = newValue)
    })
    return this
  })

  // check the existence of an element by a filter function
  link(proto, 'has', function (filter) {
    if (!isApplicable(filter)) { // as an index number
      return typeof this[offsetOf(this.length, filter)] !== 'undefined'
    }
    var found = false
    trace.call(this, function (v, i) {
      return (found = boolValueOf(filter.call(this, v, i)))
    })
    return found
  })
  // check the existence of a value
  link(proto, 'contains', function (value) {
    if (typeof value === 'undefined') {
      return false
    }
    var found = false
    trace.call(this, function (v, i) {
      return (found = thisCall(v, 'equals', value))
    })
    return found
  })

  // swap two value by offsets.
  link(proto, 'swap', function (i, j) {
    var length = this.length
    i = offsetOf(length, i)
    j = offsetOf(length, j)
    if (i === j || i < 0 || i >= length || j < 0 || j >= length) {
      return false
    }
    var tmp = this[i]
    typeof this[j] === 'undefined' ? delete this[i] : this[i] = this[j]
    typeof tmp === 'undefined' ? delete this[j] : this[j] = tmp
    return true
  })

  // retrieve the first n element(s).
  link(proto, 'first', function (count, filter) {
    if (typeof count === 'undefined') {
      return this[0]
    }
    if (isApplicable(count)) {
      var found
      trace.call(this, function (v, i) {
        return boolValueOf(count.call(this, v, i)) ? (found = v) || true : false
      })
      return found
    }
    count >>= 0
    if (count <= 0) {
      return []
    }
    var result = []
    if (isApplicable(filter)) {
      trace.call(this, function (v, i) {
        if (boolValueOf(filter.call(this, v, i))) {
          result.push(v)
          return (--count) <= 0
        } // else return false
      })
    } else {
      trace.call(this, function (v) {
        result.push(v)
        return (--count) <= 0
      })
    }
    return result
  })
  // find the index of first occurrence of a value.
  var indexOf = link(proto, 'first-of', function (value) {
    if (typeof value === 'undefined') {
      return null
    }
    var found = null
    trace.call(this, function (v, i) {
      return v === value || thisCall(v, 'equals', value)
        ? (found = i) || true : false
    })
    return found
  })
  // retrieve the last n element(s).
  link(proto, 'last', function (count, filter) {
    if (typeof count === 'undefined') {
      return this[this.length - 1]
    }
    if (isApplicable(count)) {
      var found
      retrace.call(this, function (v, i) {
        return boolValueOf(count.call(this, v, i)) ? (found = v) || true : false
      })
      return found
    }
    count >>= 0
    if (count <= 0) {
      return []
    }
    var result = []
    if (isApplicable(filter)) {
      retrace.call(this, function (v, i) {
        if (!boolValueOf(filter.call(this, v, i))) return
        result.unshift(v); count--
        return count <= 0
      })
    } else {
      retrace.call(this, function (v) {
        result.unshift(v); count--
        return count <= 0
      })
    }
    return result
  })
  // find the index of the last occurrence of a value.
  link(proto, 'last-of', function (value) {
    if (typeof value === 'undefined') {
      return null
    }
    var found = null
    retrace.call(this, function (v, i) {
      return v === value || thisCall(v, 'equals', value)
        ? (found = i) || true : false
    })
    return found
  })

  // edit current array
  link(proto, 'insert', function (index, item) {
    index = beginOf(this.length, index)
    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 2)
      args.unshift(index, 0, item)
      this.splice.apply(this, args)
    } else {
      this.splice(index, 0, item)
    }
    return this
  })
  link(proto, 'delete', function (index, count) {
    index = offsetOf(this.length, index)
    count = typeof count === 'undefined' ? 1 : count >> 0
    index >= 0 && this.splice(index, count)
    return this
  })
  link(proto, 'splice', function (index, count) {
    if ((index >>= 0) < -this.length) {
      if (arguments.length < 3) {
        return []
      }
      var args = Array.prototype.slice.call(arguments)
      args[0] = 0; args[1] = 0
      return this.splice.apply(this, args)
    }
    switch (arguments.length) {
      case 0:
        return this.splice()
      case 1:
        return this.splice(index)
      case 2:
        return this.splice(index, count)
      default:
        return this.splice.apply(this, arguments)
    }
  })

  // stack operations.
  link(proto, 'push', function () {
    Array.prototype.push.apply(this, arguments)
    return this
  })
  link(proto, 'pop', function (count) {
    return typeof count === 'undefined' ? this.pop()
      : (count >>= 0) >= this.length ? this.splice(0)
        : count > 0 ? this.splice(this.length - count)
          : this.splice(-1)
  })

  // queue operations.
  link(proto, 'enqueue', function () {
    this.unshift.apply(this, arguments)
    return this
  })
  proto.dequeue = proto.pop // dequeue is only an alias of pop.

  // reverse the order of all elements
  link(proto, 'reverse', function () {
    return this.reverse()
  })

  // re-arrange elements in an array.
  var comparerOf = function (reversing, comparer) {
    return reversing ? function (a, b) {
      var order = comparer(a, b)
      return order > 0 ? -1 : order < 0 ? 1 : 0
    } : function (a, b) {
      var order = comparer(a, b)
      return order > 0 ? 1 : order < 0 ? -1 : 0
    }
  }
  var ascComparer = function (a, b) {
    var order = thisCall(a, 'compares-to', b)
    return order > 0 ? 1 : order < 0 ? -1 : 0
  }
  var descComparer = function (a, b) {
    var order = thisCall(a, 'compares-to', b)
    return order > 0 ? -1 : order < 0 ? 1 : 0
  }
  link(proto, 'sort', function (order, comparer) {
    var reversing = false
    if (typeof order === 'function') {
      comparer = order
    } else if ((order >> 0) > 0) {
      reversing = true
    }
    var comparing = typeof comparer === 'function'
      ? comparerOf(reversing, comparer)
      : reversing ? descComparer : ascComparer
    return this.sort(comparing)
  })

  // collection operations
  link(proto, 'find', function (filter) {
    var result = []
    if (isApplicable(filter)) {
      trace.call(this, function (v, i) {
        boolValueOf(filter.call(this, v, i)) && result.push(i)
      })
    } else { // pick all valid indices.
      trace.call(this, function (v, i) { result.push(i) })
    }
    return result
  })
  link(proto, 'select', function (filter) {
    return isApplicable(filter) ? this.filter(function (v, i) {
      return typeof v !== 'undefined' && boolValueOf(filter.call(this, v, i))
    }, this) : this.filter(function (v) {
      return typeof v !== 'undefined' // pick all valid indices.
    }, this)
  })
  link(proto, 'map', function (converter) {
    return isApplicable(converter)
      ? this.map(function (v, i) {
        if (typeof v !== 'undefined') {
          return converter.call(this, v, i)
        }
      }, this) : this.slice()
  })
  link(proto, 'reduce', function (value, reducer) {
    if (!isApplicable(reducer)) {
      if (!isApplicable(value)) {
        return value
      }
      reducer = value
      value = null
    }
    return this.reduce(function (s, v, i, t) {
      return typeof v !== 'undefined' ? reducer.call(t, s, v, i) : s
    }, value)
  })

  link(proto, 'join', function (separator) {
    var last = -1
    var strings = this.reduce(function (s, v, i, t) {
      if (typeof v !== 'undefined') {
        checkSpacing(s, i, last)
        s.push(typeof v === 'string' ? v : thisCall(v, 'to-string'))
        last = i
      }
      return s
    }, [])
    checkSpacing(strings, this.length, last)
    return strings.join(typeof separator === 'string' ? separator : ' ')
  })

  // determine emptiness by array's length
  link(proto, 'is-empty', function () {
    return !(this.length > 0)
  })
  link(proto, 'not-empty', function () {
    return this.length > 0
  })

  // default object persistency & describing logic
  var toCode = link(proto, 'to-code', function (printing) {
    var ctx
    if (printing instanceof EncodingContext$) {
      ctx = printing
      var sym = ctx.begin(this)
      if (sym) { return sym }
    } else {
      ctx = new EncodingContext$(this, printing)
    }
    var code = [symbolLiteral]
    var first = true
    var last = -1
    trace.call(this, function (v, i) {
      first ? (first = false) : ctx.printing && code.push(symbolComma)
      v = ctx.encode(v)
      ;(i - last) > 1 ? code.push(i, symbolPairing, v) : code.push(v)
      last = i
    })
    return ctx.end(this, Type, new Tuple$(code))
  })

  // Description
  link(proto, 'to-string', function () {
    return thisCall(toCode.call(this, true), 'to-string')
  })

  // Indexer
  var indexer = link(proto, ':', function (index, value) {
    return typeof index === 'number'
      ? typeof value === 'undefined' ? getter.call(this, index)
        : setter.call(this, index, value)
      : typeof index === 'string' ? protoValueOf(this, proto, index)
        : index instanceof Symbol$ ? protoValueOf(this, proto, index.key)
          : indexOf.call(this, index)
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/bool.js":
/*!****************************!*\
  !*** ./es/generic/bool.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function boolIn ($void) {
  var $ = $void.$
  var Type = $.bool
  var link = $void.link
  var Symbol$ = $void.Symbol
  var protoValueOf = $void.protoValueOf

  // the empty value of bool is the false.
  link(Type, 'empty', false)

  // booleanize
  $void.boolValueOf = link(Type, 'of', function (value) {
    return typeof value !== 'undefined' &&
      value !== null && value !== 0 && value !== false
  }, true)

  var proto = Type.proto
  // Emptiness
  link(proto, 'is-empty', function () {
    return this === false
  })
  link(proto, 'not-empty', function () {
    return this !== false
  })

  // Representation
  link(proto, 'to-string', function () {
    return this === true ? 'true' : 'false'
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/class.js":
/*!*****************************!*\
  !*** ./es/generic/class.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function classIn ($void) {
  var $ = $void.$
  var Type = $.class
  var $Type = $.type
  var $Tuple = $.tuple
  var $Symbol = $.symbol
  var $Object = $.object
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var ClassType$ = $void.ClassType
  var ClassInst$ = $void.ClassInst
  var link = $void.link
  var typeOf = $void.typeOf
  var bindThis = $void.bindThis
  var isObject = $void.isObject
  var thisCall = $void.thisCall
  var boolValueOf = $void.boolValueOf
  var createClass = $void.createClass
  var isApplicable = $void.isApplicable
  var ownsProperty = $void.ownsProperty
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf
  var EncodingContext$ = $void.EncodingContext

  // initialize the meta class.
  link(Type, 'empty', createClass, true)

  // define a class by classes and/or class descriptors.
  link(Type, 'of', function () {
    return as.apply(createClass(), arguments)
  }, true)

  // copy fields from source objects to the target class instance or an object.
  var objectAssign = $Object.assign
  link(Type, 'attach', function (target) {
    if (target instanceof ClassInst$) {
      for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i]
        if (isObject(src)) {
          Object.assign(target, src)
          activate.call(target, src)
        }
      }
      return target
    }
    // fallback to object assign for the class may not exist on target context.
    return objectAssign.apply($Object, arguments)
  }, true)

  // the prototype of classes
  var proto = Type.proto

  // generate an empty instance.
  link(proto, 'empty', function () {
    return Object.create(this.proto)
  })

  // generate an instance without arguments.
  link(proto, 'default', function () {
    return construct.call(Object.create(this.proto))
  })

  // static construction: create an instance by arguments.
  link(proto, 'of', function () {
    return construct.apply(Object.create(this.proto), arguments)
  })

  // static activation: restore an instance by one or more property set.
  link(proto, 'from', function () {
    var inst = Object.create(this.proto)
    for (var i = 0; i < arguments.length; i++) {
      var src = arguments[i]
      if (isObject(src)) {
        Object.assign(inst, src)
        activate.call(inst, src)
      }
    }
    return inst
  })

  // make this class to act as other classes and/or class descriptors.
  var isAtom = $Tuple.accepts
  var as = link(proto, 'as', function () {
    if (Object.isFrozen(this)) {
      return this
    }
    var type_ = Object.create(null)
    var proto_ = Object.create(null)
    var args = Array.prototype.slice.call(arguments)
    for (var i = 0; i < args.length; i++) {
      var src = args[i]
      var t, p
      if (src instanceof ClassType$) {
        t = src
        p = src.proto
      } else if (isObject(src)) {
        p = src
        if (isObject(src.type)) {
          t = src.type
        } else {
          if (src.type instanceof ClassType$) {
            args.splice(i + 1, 0, src.type)
          }
          t = {}
        }
      } else {
        t = {}; p = {}
      }
      var j, key
      var names = Object.getOwnPropertyNames(t)
      for (j = 0; j < names.length; j++) {
        key = names[j]
        if (key === 'indexer') {
          // allow customized indexer for class
          !ownsProperty(proto_, ':') && isApplicable(t.indexer) && (
            proto_[':'] = t.indexer
          )
        } else if ((typeof this[key] === 'undefined') &&
          !ownsProperty(type_, key)
        ) {
          if (key !== 'name' || !(t instanceof ClassType$)) {
            // not to copy a type's name, but copy a definition name field
            type_[key] = t[key]
          }
        }
      }
      names = Object.getOwnPropertyNames(p)
      var value
      for (j = 0; j < names.length; j++) {
        key = names[j]
        if (key !== 'type' && !ownsProperty(this.proto, key) && !ownsProperty(proto_, key)) {
          value = p[key]
          proto_[key] = isAtom(value) || (typeof value === 'function') ? value : null
        }
      }
    }
    Object.assign(this, type_)
    Object.assign(this.proto, proto_)
    return this
  })

  // Convert this class's definition to a type descriptor object.
  var toObject = link(proto, 'to-object', function () {
    var typeDef = $Object.empty()
    var names = Object.getOwnPropertyNames(this.proto)
    var i, name, value, thisEmpty
    for (i = 0; i < names.length; i++) {
      name = names[i]
      if (name !== 'type') {
        value = this.proto[name]
        typeDef[name] = !isApplicable(value) ? value
          : thisCall(value, 'bind', typeof thisEmpty !== 'undefined'
            ? thisEmpty : (thisEmpty = this.empty())
          )
      }
    }
    var typeStatic = $Object.empty()
    var hasStatic = false
    names = Object.getOwnPropertyNames(this)
    for (i = 0; i < names.length; i++) {
      name = names[i]
      if (name !== 'proto') {
        value = this[name]
        typeStatic[name] = !isApplicable(value) ? value
          : thisCall(value, 'bind', this)
        hasStatic = true
      }
    }
    hasStatic && (typeDef.type = typeStatic)
    return typeDef
  })

  // Mutability
  link(proto, 'seal', function () {
    return Object.freeze(this)
  })
  link(proto, 'is-sealed', function () {
    return Object.isFrozen(this)
  })

  // Type Verification: a class is a class and a type.
  link(proto, ['is-a', 'is-an'], function (type) {
    return type === Type || type === $Type
  })
  link(proto, ['is-not-a', 'is-not-an'], function (type) {
    return type !== Type && type !== $Type
  })

  // Emptiness: shared by all classes.
  link(proto, 'is-empty', function () {
    return !(Object.getOwnPropertyNames(this.proto).length > 1) && !(
      Object.getOwnPropertyNames(this).length > (
        ownsProperty(this, 'name') ? 2 : 1
      )
    )
  })
  link(proto, 'not-empty', function () {
    return Object.getOwnPropertyNames(this.proto).length > 1 || (
      Object.getOwnPropertyNames(this).length > (
        ownsProperty(this, 'name') ? 2 : 1
      )
    )
  })

  // Encoding
  var protoToCode = link(proto, 'to-code', function () {
    return typeof this.name === 'string' && this.name
      ? sharedSymbolOf(this.name.trim()) : $Symbol.empty
  })

  // Description
  var symbolClass = sharedSymbolOf('class')
  var symbolOf = sharedSymbolOf('of')
  var objectToCode = $Object.proto['to-code']
  var tupleToString = $Tuple.proto['to-string']
  link(proto, 'to-string', function () {
    var code = protoToCode.call(this)
    if (code !== $Symbol.empty) {
      return thisCall(code, 'to-string')
    }
    code = objectToCode.call(toObject.call(this))
    if (code.$[0] === $Symbol.literal) {
      code.$[1] === $Symbol.pairing ? code.$.splice(2, 0, symbolClass)
        : code.$.splice(1, 0, $Symbol.pairing, symbolClass)
    } else {
      code = new Tuple$([symbolClass, symbolOf, code])
    }
    return tupleToString.call(code)
  })

  // the prototype of class instances
  var instance = proto.proto

  // root instance constructor
  var construct = link(instance, 'constructor', function () {
    if (this.constructor !== construct) {
      this.constructor.apply(this, arguments)
    } else { // behave like (object assign this ...)
      var args = [this]
      args.push.apply(args, arguments)
      $Object.assign.apply($Object, args)
    }
    return this
  })

  // root instance activator: accept a plain object and apply the activator logic too.
  var activate = link(instance, 'activator', function (source) {
    if (this.activator !== activate) {
      this.activator(source)
    }
    return this
  })

  // Generate a persona to act like another class.
  link(instance, 'as', function (cls, member) {
    if (!(cls instanceof ClassType$)) {
      return null
    }
    if (member instanceof Symbol$) {
      member = member.key
    } else if (typeof member !== 'string' || !member) {
      member = null
    }

    var value
    if (member) {
      value = cls.proto[member]
      return isApplicable(value) ? bindThis(this, value) : value
    }

    var names = Object.getOwnPropertyNames(cls.proto)
    var persona = Object.create($Object.proto)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      value = cls.proto[name]
      persona[name] = isApplicable(value) ? bindThis(this, value) : value
    }
    return persona
  })

  // Enable the customization of Identity.
  var is = link(instance, ['is', '==='], function (another) {
    return (this === another) || (
      this.is !== is && isApplicable(this.is) && boolValueOf(this.is(another))
    )
  })
  link(instance, ['is-not', '!=='], function (another) {
    return !is.call(this, another)
  })

  // Enable the customization of Equivalence.
  var equals = link(instance, ['equals', '=='], function (another) {
    return this === another || is.call(this, another) || (
      this.equals !== equals && isApplicable(this.equals) &&
        boolValueOf(this.equals(another))
    )
  })
  link(instance, ['not-equals', '!='], function (another) {
    return !equals.call(this, another)
  })

  // Enable the customization of Ordering.
  var comparesTo = link(instance, 'compares-to', function (another) {
    if (this === another || equals.call(this, another)) {
      return 0
    }
    var thisComparesTo = this['compares-to']
    if (thisComparesTo === comparesTo || !isApplicable(thisComparesTo)) {
      return null
    }
    var ordering = this['compares-to'](another)
    return ordering > 0 ? 1
      : ordering < 0 ? -1
        : ordering === 0 ? 0 : null
  })

  // Emptiness: allow customization.
  var isEmpty = link(instance, 'is-empty', function () {
    var overriding = this['is-empty']
    return overriding !== isEmpty && isApplicable(overriding)
      ? boolValueOf(overriding.call(this))
      : Object.getOwnPropertyNames(this).length < 1
  })
  link(instance, 'not-empty', function () {
    return !isEmpty.call(this)
  })

  // Type Verification
  var isA = link(instance, ['is-a', 'is-an'], function (t) {
    if (t === $Object || (this.type instanceof ClassType$ && t === this.type)) {
      return true
    }
    var overriding = this['is-a']
    if (overriding !== isA && isApplicable(overriding)) {
      return boolValueOf(overriding.call(this, t))
    }
    if (!(t instanceof ClassType$) || !t.proto) {
      return false
    }
    var members = Object.getOwnPropertyNames(t.proto)
    for (var i = 0; i < members.length; i++) {
      if (typeof this[members[i]] === 'undefined') {
        return false
      }
    }
    return true
  })
  link(instance, ['is-not-a', 'is-not-an'], function (t) {
    return !isA.call(this, t)
  })

  // Enable the customization of Encoding.
  var toCode = link(instance, 'to-code', function (ctx) {
    var overriding = this['to-code']
    if (overriding === toCode || typeof overriding !== 'function') {
      return objectToCode.call(this, ctx) // not overridden
    }
    if (ctx instanceof EncodingContext$) {
      var sym = ctx.begin(this)
      if (sym) { return sym }
    } else {
      ctx = new EncodingContext$(this)
    }
    var code = overriding.call(this)
    return typeOf(code) === $Object
      ? ctx.end(this, this.type, objectToCode.call(code))
      : code instanceof Tuple$ && code.plain !== true
        ? ctx.end(this, $Object, code) // app handle its type information.
        : ctx.end(this, this.type, objectToCode.call(this))
  })

  // Enable the customization of Description.
  var toString = link(instance, 'to-string', function () {
    var overriding = this['to-string']
    return overriding === toString || typeof overriding !== 'function'
      ? thisCall(toCode.call(this), 'to-string')
      : overriding.apply(this, arguments)
  })

  var indexer = link(instance, ':', function (index, value) {
    var overriding
    if (typeof index === 'string') {
      overriding = indexer
    } else if (index instanceof Symbol$) {
      index = index.key
      overriding = indexer
    } else {
      overriding = this[':']
    }
    // setter
    if (typeof value !== 'undefined') {
      return typeof index === 'string' ? (this[index] = value)
        : overriding === indexer ? null
          : overriding.apply(this, arguments)
    }
    // getting
    if (typeof index !== 'string') {
      return overriding === indexer ? null : overriding.call(this, index)
    }
    value = protoValueOf(this, typeOf(this).proto || instance, index)
    return typeof value === 'function' ? value : this[index]
  })
  indexer.get = function (key) {
    var value = instance[key]
    return typeof value === 'function' ? value : this[key]
  }

  // export type indexer.
  link(proto, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/date.js":
/*!****************************!*\
  !*** ./es/generic/date.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

function getTimezoneName () {
  var format, options
  return (
    (format = Intl && Intl.DateTimeFormat && Intl.DateTimeFormat()) &&
    (options = format && format.resolveOptions && format.resolveOptions()) &&
    options.timeZone
  ) || (
    process && process.env.TZ
  ) || UtcTimezoneOffset()
}

function UtcTimezoneOffset () {
  var offset = (new Date()).getTimezoneOffset() / 60
  return offset >= 0 ? 'UTC+' + offset.toString() : 'UTC' + offset.toString()
}

module.exports = function dateIn ($void) {
  var $ = $void.$
  var Type = $.date
  var $Object = $.object
  var link = $void.link
  var Symbol$ = $void.Symbol
  var protoValueOf = $void.protoValueOf
  var numberComparesTo = $.number.proto['compares-to']
  var numberToString = $.number.proto['to-string']

  // the empty value
  var empty = link(Type, 'empty', new Date(0))

  // the invalid value.
  var invalid = link(Type, 'invalid', new Date(NaN))

  // parse a date/time string representation to a date object.
  link(Type, 'parse', function (str) {
    return typeof str !== 'string' ? invalid : new Date(str)
  }, true)

  // get current time or the time as a string, a timestamp or data fields.
  link(Type, 'of', function (a, b, c, d, e, f, g) {
    switch (arguments.length) {
      case 0:
        return empty
      case 1: // string or timestamp
        return a instanceof Date ? a : new Date(a)
      case 2:
        return new Date(a, b - 1)
      case 3:
        return new Date(a, b - 1, c)
      case 4:
        return new Date(a, b - 1, c, d)
      case 5:
        return new Date(a, b - 1, c, d, e)
      case 6:
        return new Date(a, b - 1, c, d, e, f)
      default: // field values
        return new Date(a, b - 1, c, d, e, f, g)
    }
  }, true)

  // compose a date object with utc values of its fields
  link(Type, 'of-utc', function (a, b, c, d, e, f, g) {
    switch (arguments.length) {
      case 0:
        return empty
      case 1: // string or timestamp
        return new Date(Date.UTC(a, 0))
      case 2:
        return new Date(Date.UTC(a, b - 1))
      case 3:
        return new Date(Date.UTC(a, b - 1, c))
      case 4:
        return new Date(Date.UTC(a, b - 1, c, d))
      case 5:
        return new Date(Date.UTC(a, b - 1, c, d, e))
      case 6:
        return new Date(Date.UTC(a, b - 1, c, d, e, f))
      default: // field values
        return new Date(Date.UTC(a, b - 1, c, d, e, f, g))
    }
  }, true)

  // get current time as a date object.
  link(Type, 'now', function () {
    return new Date()
  }, true)

  // get current time as its timestamp value.
  link(Type, 'timestamp', function () {
    return Date.now()
  }, true)

  link(Type, 'timezone', function () {
    return $Object.of({
      name: getTimezoneName(),
      offset: (new Date()).getTimezoneOffset()
    })
  }, true)

  var proto = Type.proto

  // test if this is a valid date.
  link(proto, 'is-valid', function () {
    return !isNaN(this.getTime())
  })
  link(proto, 'is-invalid', function () {
    return isNaN(this.getTime())
  })

  // retrieve the date fields: year, month, day
  link(proto, 'date-fields', function (utc) {
    return isNaN(this.getTime()) ? null : utc
      ? [this.getUTCFullYear(), this.getUTCMonth() + 1, this.getUTCDate()]
      : [this.getFullYear(), this.getMonth() + 1, this.getDate()]
  })
  // retrieve the time fields: hours, minutes, seconds, milliseconds
  link(proto, 'time-fields', function (utc) {
    return isNaN(this.getTime()) ? null : utc
      ? [this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds()]
      : [this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()]
  })
  // retrieve all fields: year, month, day, hours, minutes, seconds, milliseconds
  link(proto, 'all-fields', function (utc) {
    return isNaN(this.getTime()) ? null : utc
      ? [this.getUTCFullYear(), this.getUTCMonth() + 1, this.getUTCDate(),
        this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds()]
      : [this.getFullYear(), this.getMonth() + 1, this.getDate(),
        this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()]
  })
  // get the week day value, which starts from 0 for Sunday.
  link(proto, 'week-day', function (utc) {
    return isNaN(this.getTime()) ? null
      : utc ? this.getUTCDay() : this.getDay()
  })

  link(proto, 'timestamp', function (utc) {
    return this.getTime()
  })

  // support & override general operators
  link(proto, '+', function (milliseconds) {
    return typeof milliseconds === 'number'
      ? new Date(this.getTime() + milliseconds)
      : this
  })
  link(proto, '-', function (dateOrTime) {
    return typeof dateOrTime === 'number'
      ? new Date(this.getTime() - dateOrTime)
      : dateOrTime instanceof Date
        ? this.getTime() - dateOrTime.getTime()
        : this
  })

  // Ordering: date comparison
  var comparesTo = link(proto, 'compares-to', function (another) {
    return another instanceof Date
      ? numberComparesTo.call(this.getTime(), another.getTime())
      : null
  })

  // override Identity and Equivalence logic to test by timestamp value
  link(proto, ['is', '===', 'equals', '=='], function (another) {
    return this === another || comparesTo.call(this, another) === 0
  })
  link(proto, ['is-not', '!==', 'not-equals', '!='], function (another) {
    return this !== another && comparesTo.call(this, another) !== 0
  })

  // ordering operators for instance values
  link(proto, '>', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order > 0 : null
  })
  link(proto, '>=', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order >= 0 : null
  })
  link(proto, '<', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order < 0 : null
  })
  link(proto, '<=', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order <= 0 : null
  })

  // emptiness is defined to the 0 value of timestamp.
  link(proto, 'is-empty', function () {
    var ts = this.getTime()
    return ts === 0 || isNaN(ts)
  })
  link(proto, 'not-empty', function () {
    var ts = this.getTime()
    return ts !== 0 && !isNaN(ts)
  })

  // Representation for instance & description for proto itself.
  link(proto, 'to-string', function (format) {
    if (typeof format === 'undefined') {
      // encoding as source code by default.
      var ts = this.getTime()
      return isNaN(ts) ? '(date invalid)'
        : ts === 0 ? '(date empty)'
          : '(date of ' + numberToString.call(this.getTime()) + ')'
    }
    switch (format.toLocaleLowerCase()) {
      case 'gmt':
      case 'utc':
        return this.toUTCString()
      case 'date':
        return this.toLocaleDateString()
      case 'time':
        return this.toLocaleTimeString()
      default:
        return this.toLocaleString()
    }
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./es/generic/encoding.js":
/*!********************************!*\
  !*** ./es/generic/encoding.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// for any object, the object.proto.to-code will always be called firstly,
// in the default to-code, the object.to-code will be called.
// the same for the constructor: to ensure the instance will always be returned.
// for object:
//  - anything defined in type cannot be overridden in instance
//  - object.proto.* will allow the overridden and ensure the consistency and type safe.

var createIndex = function () {
  var index = new Map()
  return {
    get: index.get.bind(index),
    set: function (key, value) {
      index.set(key, value)
      return value
    },
    add: function (key, value) {
      index.set(key, value)
      return value
    }
  }
}

module.exports = function encodingIn ($void) {
  var $ = $void.$
  var $Tuple = $.tuple
  var $Array = $.array
  var $Object = $.object
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var isObject = $void.isObject
  var thisCall = $void.thisCall
  var sharedSymbolOf = $void.sharedSymbolOf

  var symbolLocals = sharedSymbolOf('_')
  var symbolObject = sharedSymbolOf('object')
  var symbolClass = sharedSymbolOf('class')
  var symbolAppend = sharedSymbolOf('append')
  var symbolAssign = sharedSymbolOf('assign')
  var symbolAttach = sharedSymbolOf('attach')

  var normalize = function (type) {
    type = type['to-code']()
    return type === $Symbol.empty ? symbolObject : type
  }
  var createInst = function (type) {
    return type === $Array ? $Tuple.array
      : type === $Object || (type = normalize(type)) === symbolObject
        ? $Tuple.object
        : new Tuple$([$Symbol.literal, $Symbol.pairing, type])
  }
  var updateInst = function (ref, type, code) {
    // remove unnecessary activation for data entity.
    var items = code.$
    if (items.length > 2 && items[0] === $Symbol.literal &&
      items[1] === $Symbol.pairing && (items[2] instanceof Symbol$)
    ) {
      var cls = items[2].key
      if (cls !== 'array' && cls !== 'object' && cls !== 'class') {
        items.length > 3 ? items.splice(1, 2) : items.splice(2, 1)
      }
    }
    return type === $Array
      ? new Tuple$([ref, symbolAppend, code])
      : type === $Object || (type = normalize(type)) === symbolObject
        ? new Tuple$([symbolObject, symbolAssign, ref, code])
        : new Tuple$([symbolClass, symbolAttach, ref, code])
  }

  $void.EncodingContext = function (root, printing) {
    this.objects = createIndex()
    this.objects.add(this.root = root, null)
    this.clist = []
    this.shared = []
    this.printing = printing
  }
  $void.EncodingContext.prototype = {
    _createRef: function (offset) {
      var ref = new Tuple$([symbolLocals, this.shared.length])
      this.shared.push(offset)
      return ref
    },
    begin: function (obj) {
      var offset = this.objects.get(obj)
      if (typeof offset === 'undefined') { // first touch
        return this.objects.add(obj, null)
      }
      var ref
      if (offset === null) { // to be recursively reused.
        offset = this.clist.length
        ref = this._createRef(offset)
        this.objects.set(obj, offset)
        this.clist.push([ref, null, null])
        return ref
      }
      var record = this.clist[offset]
      ref = record[0]
      if (!ref) { // to be reused.
        ref = record[0] = this._createRef(offset)
        var code = record[2]
        var newCode = new Tuple$(code.$) // copy code of value.
        code.$ = ref.$ // update original code from value to ref.
        record[2] = newCode // save the new code of value.
      }
      return ref
    },
    encode: function (obj) {
      return typeof obj === 'undefined' || obj === null ? null
        : typeof obj === 'number' || typeof obj === 'string' ? obj
          : (Array.isArray(obj) || isObject(obj))
            ? thisCall(obj, 'to-code', this)
            : thisCall(obj, 'to-code')
    },
    end: function (obj, type, code) {
      // try to supplement type to code
      if (type !== $Array && type !== $Object && type.name) {
        if (code.$[1] !== $Symbol.pairing) {
          code.$.splice(1, 0, $Symbol.pairing, sharedSymbolOf(type.name))
        } else if (code.$.length < 3) {
          code.$.splice(2, 0, sharedSymbolOf(type.name))
        }
      }
      // assert(code instanceof Tuple$)
      var offset = this.objects.get(obj)
      // assert(typeof offset !== 'undefined')
      if (offset === null) {
        offset = this.clist.length
        this.objects.set(obj, offset)
        this.clist.push([null, type, code])
        return obj === this.root ? this._finalize(offset) : code
      }
      // recursive reference
      var record = this.clist[offset]
      record[1] = type
      record[2] = code
      return obj === this.root ? this._finalize(offset) : record[0]
    },
    _finalize: function (rootOffset) {
      if (this.shared.length < 1) {
        // no circular or shared array/object.
        return this.clist[rootOffset][2]
      }
      var args = [$Symbol.literal] // (@ ...)
      var body = [new Tuple$([ // (local _ args) ...
        $Symbol.local, symbolLocals, new Tuple$(args)
      ])]
      var root
      for (var i = 0; i < this.shared.length; i++) {
        var offset = this.shared[i]
        var record = this.clist[offset]
        args.push(createInst(record[1]))
        offset === rootOffset
          ? (root = updateInst.apply(null, record))
          : body.push(updateInst.apply(null, record))
      }
      body.push(root || this.clist[rootOffset][2])
      return new Tuple$([ // (=>:() (local _ (@ ...)) ...)
        $Symbol.function, $Symbol.pairing, $Tuple.empty, new Tuple$(body, true)
      ])
    }
  }
}


/***/ }),

/***/ "./es/generic/function.js":
/*!********************************!*\
  !*** ./es/generic/function.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function functionIn ($void) {
  var $ = $void.$
  var Type = $.function
  var $Tuple = $.tuple
  var $Object = $.object
  var Tuple$ = $void.Tuple
  var link = $void.link
  var bindThis = $void.bindThis
  var safelyAssign = $void.safelyAssign
  var prepareOperation = $void.prepareOperation
  var prepareApplicable = $void.prepareApplicable

  // the noop function
  var noop = link(Type, 'noop', $void.function(function () {
    return null
  }, $Tuple.function), true)

  // implement common operation features.
  prepareOperation(Type, noop, $Tuple.function)

  var proto = Type.proto
  // bind a function to a fixed subject.
  link(proto, 'bind', function ($this) {
    return bindThis(typeof $this !== 'undefined' ? $this : null, this)
  })

  // JS-InterOp: retrieve generic members of a native function.
  link(proto, ['generic', '$'], function () {
    return this['--generic'] || (
      this.code instanceof Tuple$ ? null // only for generic functions.
        : (this['--generic'] = safelyAssign($Object.empty(),
          typeof this.bound === 'function' ? this.bound : this
        ))
    )
  })

  // implement applicable operation features.
  prepareApplicable(Type, $Tuple.function)
}


/***/ }),

/***/ "./es/generic/genesis.js":
/*!*******************************!*\
  !*** ./es/generic/genesis.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
  /*
    The Prologue.
  */
  // The Void is out of the scope of the Being and cannot be analyzed in the
  // scope of Being. Therefore, it cannot be described as either existent or
  // nonexistent. Boolean logic is part of the Being.
  var $void = {}

  /*
    The Beginning.
  */
  /* In the beginning God created the heavens and the earth. */
  var Null = $void.null = Object.create(null)
  /* Now the earth was formless and empty, */
  var $ = $void.$ = Object.create(null) /* 0. Generation */

  /* “Let there be light,” and there was light. */
  // The light is the laws, which are the foundation of all beings.
  var Prototype = Object.create(Null) /* 1. Derivation */
  var Type$ = $void.Type$ = function () { /* 2. Separation & Aggregation */
    // This function should be executed once, and only once.
    // The primal type is derived from the supreme prototype.
    this.proto = Prototype
    // The primal type is the container type of the supreme prototype.
    defineTypeProperty(Prototype, this)
  }
  Type$.prototype = Prototype

  /* Nameless beginning of heaven and earth, the famous mother of all things. */
  function naming (type, name) {
    $[name] = type
    type.name = name
    return type
  }

  /* ... he separated the light from the darkness, */
  var Type = new Type$()
  /* ... called the light “day,”  */
  naming(Type, 'type')
  /* ... and the darkness he called “night.” */
  $.null = null

  // The logical noumenon of null is not accessible directly, otherwise it will
  // cause some confusion in evaluation process.
  // P.S, so is our fate too?

  /* A placeholder constructor to test a type. */
  $void.Type = function () {}
  $void.Type.prototype = Type

  /* It's ready to create primitive types, */
  function create (name) {
    var type = Object.create(Type)
    // a new type should have a new nature.
    type.proto = Object.create(Type.proto)
    // a proto always intrinsically knows its container type.
    defineTypeProperty(type.proto, type)
    // give a name to the new type.
    naming(type, name)
    return type
  }

  /* And there was evening, and there was morning — the first day. */
  /*   - from Bible and Dao Te Ching */

  /*
    The Creating.
  */
  /* Static Value Types */
  /* All static values are fixed points of evaluation function. */
  /* All static values can be fully encoded and recovered by evaluation. */

  // A boolean type is not a prerequisite to implement boolean logic, but it
  // may help to avoid ambiguity in many cases.
  create('bool')

  // A string is a piece of free form text.
  create('string')

  // A number may have a real number value in the proper range.
  create('number')

  // A date value is a combination of a timestamp and a associated locale string.
  create('date')
  $void.Date = Date

  // A range value represents a discrete sequence of numbers in the interval of
  // [begin, end) and a step value.
  create('range')
  var Range$ = $void.Range = function (begin, end, step) {
    this.begin = begin
    this.end = end
    this.step = step
  }
  Range$.prototype = $.range.proto

  /* Expression Types */
  /* An expression entity may produce another entity after evaluation. */
  /* An expression value can be fully encoded and recovered. */
  /* A static value can also be a part of an expression. */

  // A symbol is an identifer of a semantic element, so the string value of its
  // key must comply with some fundamental lexical rules.
  // A symbol will be resolved to the associated value under current context or
  // null by the evaluation function.
  create('symbol')
  var Symbol$ = $void.Symbol = function (key) {
    this.key = key
  }
  Symbol$.prototype = $.symbol.proto

  // A tuple is a list of other static values, symbols and tuples.
  // A tuple will be interpreted as a statement under current context to produce
  // an output value by the evaluation function.
  // The name 'list' is left to be used for more common scenarios.
  create('tuple')
  var Tuple$ = $void.Tuple = function (list, plain, source) {
    this.$ = list // hidden native data
    this.plain = plain === true // as code block.
    if (source) { // reserved for source map and other debug information.
      this.source = source
    }
  }
  Tuple$.prototype = $.tuple.proto

  /* Operation Types */
  /* All operations will be evaluated to the output of its invocation. */

  // An operator is an operation which accepts raw argument expressions, which
  // means no evaluation happens to arguments before the invocation, to allow
  // more syntax structures can be defined.
  // An operator is an immutable entity and can be fully encoded.
  var operator = create('operator')
  $void.operator = function (impl, code) {
    impl.type = $.operator
    impl.code = code
    return impl
  }

  // the container for static operators. Static operators are taken as an
  // essential part of the language itself. They cannot be overridden.
  $void.staticOperators = Object.create(null)

  // A lambda is another type of operation which wants the values of its arguments
  // as input, so the runtime helps to evaluate all them before invocation.
  // A lambda is an immutable entity and can be fully encoded.
  create('lambda')
  $void.lambda = function (impl, code) {
    impl.type = $.lambda
    impl.code = code
    return impl
  }
  $void.stambda = function (impl, code) {
    impl.type = $.lambda
    impl.code = code
    impl.static = true
    return impl
  }
  $void.constambda = function (impl, code) {
    impl.type = $.lambda
    impl.code = code
    impl.const = true
    if (typeof impl.this === 'undefined') {
      impl.this = null
    }
    if (typeof impl.bound !== 'function') {
      impl.bound = impl
    }
    return impl
  }

  // A function is an operation which works like a Closure. Its behavior depends
  // on both the values of arguments and current values in its outer context.
  // A function is not explicitly alterable but its implicit context is dynamic
  // and persistent in running. So its overall state is mutable.
  // For the existence of the context, a function cannot be fully encoded. But
  // it may be automatically downgraded to a lambda when the encoding is required.
  create('function')
  $void.function = function (impl, code) {
    impl.type = $.function
    impl.code = code
    return impl
  }

  // an operator is not a first-class value, so it can only be a direct predicate.
  $void.isApplicable = function (func) {
    return typeof func === 'function' && func.type !== operator
  }

  /* Transient Entity Types */
  /* All transient entities will be encoded to empty instances. */

  // A special type to wrap the transient state of an ongoing iteration.
  create('iterator')
  var Iterator$ = $void.Iterator = function (next) {
    this.next = next
  }
  Iterator$.prototype = $.iterator.proto

  // A special type to wrap the transient state of an ongoing action.
  create('promise')
  // If it's missing, app layer should provide the polyfill.
  $void.Promise = Promise

  /* Compound Types */
  /* By default, compound entities are mutable. */
  /* All compound entities are also fixed points of evaluation function. */

  // A collection of values indexed by zero-based integers.
  create('array')

  // The object is the fundamental type of all compound entities.
  create('object')
  var Object$ = $void.Object = function (src) {
    if (src) {
      Object.assign(this, src)
    }
  }
  Object$.prototype = $.object.proto

  // A collection of unique values indexed by themselves.
  create('set')

  // A collection of key-value pairs indexed by unique keys.
  create('map')

  /*
    The Evolution.
  */
  // Class is a meta type to create more types.
  var $Class = naming(Object.create(Type), 'class')

  // the prototype of classes is also a type.
  var $ClassProto = $Class.proto = Object.create(Type)
  $ClassProto.name = undefined
  $ClassProto.type = $Class

  // A fake constructor for instanceof checking for a class.
  var ClassType$ = $void.ClassType = function () {}
  ClassType$.prototype = $ClassProto

  // the prototype of class instances is object.proto.
  var $Instance = $ClassProto.proto = Object.create($.object.proto)
  // A fake constructor for instanceof checking for an instance of a class.
  var ClassInst$ = $void.ClassInst = function () {}
  ClassInst$.prototype = $Instance

  // export the ability of creation to enable an autonomous process.
  $void.createClass = function () {
    var class_ = Object.create($ClassProto)
    // a new type should have a new nature.
    class_.proto = Object.create($Instance)
    // a proto always intrinsically knows its container type.
    defineTypeProperty(class_.proto, class_)
    return class_
  }

  // type is not enumerable.
  $void.defineProperty = defineProperty
  function defineProperty (obj, name, value) {
    Object.defineProperty(obj, name, {
      enumerable: false,
      configurable: false,
      writable: true,
      value: value
    })
    return value
  }

  function defineTypeProperty (proto, type) {
    return defineProperty(proto, 'type', type)
  }

  $void.defineConst = defineConst
  function defineConst (ctx, key, value) {
    Object.defineProperty(ctx, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    })
    return value
  }

  return $void
}


/***/ }),

/***/ "./es/generic/global.js":
/*!******************************!*\
  !*** ./es/generic/global.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function globalIn ($void) {
  var $ = $void.$
  var $export = $void.export
  var sharedSymbolOf = $void.sharedSymbolOf

  // an empty symbol to be resolve to null.
  $export($, '', null)

  // special empty symbols
  $export($, '...', null)
  // a readable alias of '...'
  $export($, 'etc', null)

  // constant values
  $export($, 'null', null)
  $export($, 'true', true)
  $export($, 'false', false)

  // punctuation pure Symbols
  $export($, '\\', sharedSymbolOf('\\'))
  $export($, '(', sharedSymbolOf('('))
  $export($, ')', sharedSymbolOf(')'))
  $export($, ',', sharedSymbolOf(','))
  $export($, ';', sharedSymbolOf(';'))
  $export($, '.', sharedSymbolOf('.'))
  $export($, '@', sharedSymbolOf('@'))
  $export($, ':', sharedSymbolOf(':'))
  $export($, '$', sharedSymbolOf('$'))
  $export($, '#', sharedSymbolOf('#'))
  $export($, '[', sharedSymbolOf('['))
  $export($, ']', sharedSymbolOf(']'))
  $export($, '{', sharedSymbolOf('{'))
  $export($, '}', sharedSymbolOf('}'))

  // other pure symbols
  $export($, 'else', sharedSymbolOf('else'))

  // global enum value.
  $export($, sharedSymbolOf('descending').key, 1)
  $export($, sharedSymbolOf('equivalent').key, 0)
  $export($, sharedSymbolOf('ascending').key, -1)
}


/***/ }),

/***/ "./es/generic/iterator.js":
/*!********************************!*\
  !*** ./es/generic/iterator.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function iterate ($void) {
  var $ = $void.$
  var Type = $.iterator
  var $Array = $.array
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var Iterator$ = $void.Iterator
  var link = $void.link
  var thisCall = $void.thisCall
  var boolValueOf = $void.boolValueOf
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var numberValueOf = $void.numberValueOf
  var sharedSymbolOf = $void.sharedSymbolOf

  // try to get an iterator function for an entity
  var iterateOf = $void.iterateOf = function (source) {
    return isApplicable(source) ? source
      : isApplicable(source = thisCall(source, 'iterate')) ? source : null
  }

  // try to get an iterator function for an entity
  var iterateOfGeneric = $void.iterateOfGeneric = function (iterator, expandValue) {
    if (!iterator || typeof iterator.next !== 'function') {
      return null
    }

    var current
    return expandValue ? function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      if (current === null) {
        return null
      }
      var step = iterator.next()
      return (current = !step || step.done ? null : step.value)
    } : function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      if (current === null) {
        return null
      }
      var step = iterator.next()
      return (current = !step || step.done ? null : [step.value])
    }
  }

  // create an empty iterator.
  var empty = link(Type, 'empty', new Iterator$(null))

  // create an iterator object for an iterable entity.
  link(Type, 'of', function (iterable) {
    if (iterable instanceof Iterator$) {
      return iterable
    }
    var next = iterateOf(iterable)
    return next ? new Iterator$(next) : empty
  }, true)

  // create an iterator object for an native iterator.
  link(Type, 'of-generic', function (iterator) {
    var next = iterateOfGeneric(iterator)
    return next ? new Iterator$(next) : empty
  }, true)

  // create an iterator object for an unsafe iterable entity.
  var unsafe = function (next) {
    var last
    return function (inSitu) {
      if (typeof last !== 'undefined' && boolValueOf(inSitu)) {
        return last
      }
      if (next === null) {
        return null
      }
      var current = next()
      return current === last || Object.is(current, last)
        ? (next = null) // each iteration must vary.
        : (last = current)
    }
  }
  link(Type, 'of-unsafe', function (iterable) {
    var next = iterateOf(iterable)
    return next ? new Iterator$(unsafe(next)) : empty
  }, true)

  var proto = Type.proto
  // an iterator object is also iterable.
  link(proto, 'iterate', function () {
    return this.next
  })

  // an iterator object is also iterable.
  link(proto, 'skip', function (count) {
    count >>= 0
    if (!this.next || count <= 0) {
      return this
    }

    var current
    var next = this.next
    this.next = function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      var value
      while (count > 0) {
        value = next(); count--
        if (typeof value === 'undefined' || value === null) {
          next = null; break
        }
      }
      value = next && next()
      return typeof value === 'undefined' || value === null ? null
        : (current = value)
    }
    return this
  })

  // an iterator object is also iterable.
  link(proto, 'keep', function (count) {
    if (!this.next) {
      return this
    }
    count >>= 0
    if (count <= 0) {
      this.next = null
      return this
    }
    var current
    var next = this.next
    this.next = function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      if (count <= 0) {
        return null
      }
      var value = next()
      if (--count <= 0) {
        next = null
      }
      return typeof value === 'undefined' || value === null ? null
        : (current = value)
    }
    return this
  })

  // select a subset of all items.
  link(proto, 'select', function (filter) {
    if (!this.next) {
      return this
    }
    if (!isApplicable(filter)) {
      if (!boolValueOf(filter)) {
        this.next = null
      }
      return this
    }
    var current
    var next = this.next
    this.next = function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      var value = next && next()
      while (typeof value !== 'undefined' && value !== null) {
        if (boolValueOf(Array.isArray(value)
          ? filter.apply(this, value) : filter.call(this, value))
        ) {
          return (current = value)
        }
        value = next()
      }
      return (next = null)
    }
    return this
  })

  // map each item to a new value.
  link(proto, 'map', function (converter) {
    if (!this.next) {
      return this
    }
    var convert = isApplicable(converter) ? converter : function () {
      return converter
    }
    var current
    var next = this.next
    this.next = function (inSitu) {
      if (typeof current !== 'undefined' &&
        typeof inSitu !== 'undefined' && boolValueOf(inSitu)) {
        return current
      }
      var value = next && next()
      if (typeof value === 'undefined' || value === null) {
        return (next = null)
      }
      current = Array.isArray(value)
        ? convert.apply(this, value) : convert.call(this, value)
      return Array.isArray(current) ? current : (current = [current])
    }
    return this
  })

  // accumulate all items to produce a value.
  link(proto, 'reduce', function (value, reducer) {
    if (!isApplicable(reducer)) {
      if (!isApplicable(value)) {
        return typeof value === 'undefined'
          ? count.call(this)
          : finish.call(this, value)
      } else {
        reducer = value
        value = null
      }
    }
    var args
    var item = this.next && this.next()
    while (typeof item !== 'undefined' && item !== null) {
      if (Array.isArray(item)) {
        args = item.slice()
        args.unshift(value)
      } else {
        args = [value, item]
      }
      value = reducer.apply(this, args)
      item = this.next()
    }
    this.next = null
    return value
  })

  // count the number of iterations.
  var count = link(proto, ['count', 'for-each'], function (filter) {
    var counter = 0
    var value = this.next && this.next()
    if (isApplicable(filter)) {
      while (typeof value !== 'undefined' && value != null) {
        (boolValueOf(Array.isArray(value)
          ? filter.apply(this, value) : filter.call(this, value))
        ) && counter++
        value = this.next()
      }
    } else {
      while (typeof value !== 'undefined' && value != null) {
        counter++
        value = this.next()
      }
    }
    this.next = null
    return counter
  })

  // sum the values of all iterations.
  link(proto, 'sum', function (base) {
    var sum = typeof base === 'number' ? base : numberValueOf(base)
    var value = this.next && this.next()
    while (typeof value !== 'undefined' && value != null) {
      if (Array.isArray(value)) {
        value = value.length > 0 ? value[0] : 0
      }
      sum += typeof value === 'number' ? value : numberValueOf(value)
      value = this.next()
    }
    this.next = null
    return sum
  })

  // calculate the average value of all iterations.
  link(proto, 'average', function (defaultValue) {
    var counter = 0
    var sum = 0
    var value = this.next && this.next()
    while (typeof value !== 'undefined' && value != null) {
      counter++
      if (Array.isArray(value)) {
        value = value.length > 0 ? value[0] : 0
      }
      sum += typeof value === 'number' ? value : numberValueOf(value)
      value = this.next()
    }
    this.next = null
    return (counter > 0) && !isNaN(sum /= counter) ? sum
      : typeof defaultValue === 'number' ? defaultValue : 0
  })

  // find the maximum value of all iterations.
  link(proto, 'max', function (filter) {
    var max = null
    var value = this.next && this.next()
    if (isApplicable(filter)) {
      while (typeof value !== 'undefined' && value != null) {
        if (Array.isArray(value) && value.length > 0) {
          value = value[0]
          if (filter.call(this, value) && (max === null ||
            thisCall(value, 'compares-to', max) > 0)) {
            max = value
          }
        }
        value = this.next()
      }
    } else {
      while (typeof value !== 'undefined' && value != null) {
        if (Array.isArray(value) && value.length > 0) {
          value = value[0]
          if (max === null || thisCall(value, 'compares-to', max) > 0) {
            max = value
          }
        }
        value = this.next()
      }
    }
    this.next = null
    return max
  })

  // find the minimum value of all iterations.
  link(proto, 'min', function (filter) {
    var min = null
    var value = this.next && this.next()
    if (isApplicable(filter)) {
      while (typeof value !== 'undefined' && value != null) {
        if (Array.isArray(value) && value.length > 0) {
          value = value[0]
          if (filter.call(this, value) && (min === null ||
            thisCall(value, 'compares-to', min) < 0)) {
            min = value
          }
        }
        value = this.next()
      }
    } else {
      while (typeof value !== 'undefined' && value != null) {
        if (Array.isArray(value) && value.length > 0) {
          value = value[0]
          if (min === null || thisCall(value, 'compares-to', min) < 0) {
            min = value
          }
        }
        value = this.next()
      }
    }
    this.next = null
    return min
  })

  // determine emptiness by its inner iterator function.
  link(proto, 'is-empty', function () {
    return !this.next
  })
  link(proto, 'not-empty', function () {
    return !!this.next
  })

  // concatenate the values of all iterations.
  link(proto, 'join', function (separator) {
    var str = ''
    if (typeof separator !== 'string') {
      separator = ' '
    }
    var value = this.next && this.next()
    while (typeof value !== 'undefined' && value != null) {
      if (Array.isArray(value)) {
        value = value.length > 0 ? value[0] : ''
      }
      if (str.length > 0) { str += separator }
      str += typeof value === 'string' ? value : thisCall(value, 'to-string')
      value = this.next()
    }
    this.next = null
    return str
  })

  // collect the main value of all iterations.
  link(proto, 'collect', function (list) {
    if (!Array.isArray(list)) {
      list = []
    }
    var value = this.next && this.next()
    while (typeof value !== 'undefined' && value != null) {
      list.push(!Array.isArray(value) ? value
        : value = value.length > 0 ? value[0] : null)
      value = this.next()
    }
    this.next = null
    return list
  })

  // finish all iterations.
  var finish = link(proto, 'finish', function (nil) {
    nil = [nil]
    var value = this.next && this.next()
    while (typeof value !== 'undefined' && value != null) {
      nil = value
      value = this.next()
    }
    this.next = null
    return !Array.isArray(nil) ? nil
      : nil.length > 0 ? nil[0] : null
  })

  // all iterators will be encoded to an empty iterator.
  var arrayProto = $Array.proto
  var symbolOf = sharedSymbolOf('of')
  var symbolIterator = sharedSymbolOf('iterator')
  var emptyCode = new Tuple$([symbolIterator, sharedSymbolOf('empty')])
  var toCode = link(proto, 'to-code', function () {
    if (!this.next) {
      return emptyCode
    }
    var list = this.collect()
    this.next = arrayProto.iterate.call(list)
    return new Tuple$([
      symbolIterator, symbolOf, arrayProto['to-code'].call(list)
    ])
  })

  // Description
  var tupleToString = $.tuple.proto['to-string']
  var emptyCodeStr = '(iterator empty)'
  link(proto, 'to-string', function (separator) {
    return !this.next ? emptyCodeStr
      : tupleToString.call(toCode.call(this))
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/lambda.js":
/*!******************************!*\
  !*** ./es/generic/lambda.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function lambdaIn ($void) {
  var $ = $void.$
  var Type = $.lambda
  var $Tuple = $.tuple
  var link = $void.link
  var bindThis = $void.bindThis
  var constambda = $void.constambda
  var prepareOperation = $void.prepareOperation
  var prepareApplicable = $void.prepareApplicable

  // the noop lambda
  var noop = link(Type, 'noop', $void.lambda(function () {
    return null
  }, $Tuple.lambda), true)

  link(Type, 'static', $void.constambda(function () {
    return null
  }, $Tuple.stambda), true)

  var proto = Type.proto
  link(proto, 'is-static', function () {
    return this.static === true || this.const === true
  })

  link(proto, 'is-const', function () {
    return this.const === true
  })

  // bind a lambda to a fixed subject.
  link(proto, 'bind', function (arg) {
    if (typeof this.bound === 'function') {
      return this
    }
    if (typeof arg === 'undefined') {
      arg = null
    }
    return this.static !== true || typeof this.this === 'undefined'
      ? bindThis(arg, this)
      : constambda(this.bind(null, arg), this.code)
  })

  // implement common operation features.
  prepareOperation(Type, noop, $Tuple.lambda)

  // implement applicable operation features.
  prepareApplicable(Type, $Tuple.lambda)
}


/***/ }),

/***/ "./es/generic/map.js":
/*!***************************!*\
  !*** ./es/generic/map.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function arrayIn ($void) {
  var $ = $void.$
  var Type = $.map
  var $Array = $.array
  var $Symbol = $.symbol
  var $Iterator = $.iterator
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var link = $void.link
  var thisCall = $void.thisCall
  var boolValueOf = $void.boolValueOf
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf
  var EncodingContext$ = $void.EncodingContext
  var iterateOfGeneric = $void.iterateOfGeneric

  var symbolComma = $Symbol.comma
  var symbolLiteral = $Symbol.literal
  var symbolPairing = $Symbol.pairing
  var symbolMap = sharedSymbolOf('map')

  var iteratorOfGeneric = $Iterator['of-generic']

  // create an empty map.
  link(Type, 'empty', function () {
    return new Map()
  }, true)

  // create a map with a series of key-value pairs
  link(Type, 'of', function () {
    var map = new Map()
    for (var i = 0, len = arguments.length; i < len; i++) {
      mapAdd.call(map, arguments[i])
    }
    return map
  }, true)

  var mapFrom = link(Type, 'from', function () {
    var map = new Map()
    for (var i = 0, len = arguments.length; i < len; i++) {
      var pairs = arguments[i]
      if (pairs instanceof Map) {
        pairs.forEach(function (v, k) { map.set(k, v) })
      } else {
        if (!(pairs instanceof Set) && !Array.isArray(pairs)) {
          pairs = $Array.from(pairs)
        }
        pairs.forEach(function (pair) {
          mapAdd.call(map, pair)
        })
      }
    }
    return map
  }, true)

  var proto = Type.proto
  link(proto, 'size', function () {
    return this.size
  })

  link(proto, 'has', function (key) {
    return this.has(key)
  })
  link(proto, 'contains', function (keys) { // an array, set of keys, or another map.
    if (keys instanceof Map) {
      keys = keys.keys()
    } else if (!(keys instanceof Set) && !Array.isArray(keys)) {
      keys = $Array.from(keys)
    }
    for (var key of keys) {
      if (!this.has(key)) {
        return false
      }
    }
    return true
  })

  var mapAdd = link(proto, 'add', function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var pair = arguments[i]
      Array.isArray(pair) ? mapSet.apply(this, pair)
        // this keeps consistent with literal logic.
        : this.set(pair, null)
    }
    return this
  })
  var mapSet = link(proto, 'set', function (key, value) {
    if (arguments.length > 0) {
      this.set(key, value)
    }
    return value
  })
  link(proto, 'get', function (key) {
    return this.get(typeof key === 'undefined' ? null : key)
  })

  link(proto, ['combines-with', 'combines', '+='], function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var pairs = arguments[i]
      if (pairs instanceof Map) {
        pairs.forEach(function (v, k) {
          this.set(k, v)
        })
      } else {
        if (!(pairs instanceof Set) && !Array.isArray(pairs)) {
          pairs = $Array.from(pairs)
        }
        pairs.forEach(function (pair) {
          mapAdd.call(this, pair)
        })
      }
    }
    return this
  })

  link(proto, ['merge', '+'], function () { // other collections
    var sources = Array.prototype.slice.call(arguments)
    sources.unshift(this)
    return mapFrom.apply(Type, sources)
  })

  link(proto, 'delete', function () { // keys
    for (var i = 0, len = arguments.length; i < len; i++) {
      this.delete(arguments[i])
    }
    return this
  })
  link(proto, 'remove', function () { // other maps, or set/array of keys
    for (var i = 0, len = arguments.length; i < len; i++) {
      var keys = arguments[i]
      if (keys instanceof Map) {
        keys = keys.keys()
      } else if (!(keys instanceof Set) && !Array.isArray(keys)) {
        keys = $Array.from(keys)
      }
      for (var key of keys) {
        this.delete(key)
      }
    }
    return this
  })
  link(proto, 'clear', function () {
    this.clear()
    return this
  })

  link(proto, 'iterate', function () {
    return iterateOfGeneric(this.entries(), true)
  })
  link(proto, 'keys', function () {
    return iteratorOfGeneric(this.keys())
  })
  link(proto, 'values', function () {
    return iteratorOfGeneric(this.values())
  })
  link(proto, 'pairs', function () {
    return iteratorOfGeneric(this.entries())
  })

  link(proto, 'copy', function () {
    return new Map(this)
  })

  // return the amount of elements.
  link(proto, ['count', 'for-each'], function (filter) {
    if (!isApplicable(filter)) {
      return this.size // keep consistency with array.
    }
    var counter = 0
    this.forEach(function (v, k, m) {
      boolValueOf(filter.call(m, k, v)) && counter++
    })
    return counter
  })

  // the equivalence of two maps only considers the keys.
  link(proto, ['equals', '=='], function (another) {
    if (this === another) {
      return true
    }
    if (!(another instanceof Map) || this.size !== another.size) {
      return false
    }
    for (var key of another.keys()) {
      if (!this.has(key)) {
        return false
      }
    }
    return true
  })
  link(proto, ['not-equals', '!='], function (another) {
    if (this === another) {
      return false
    }
    if (!(another instanceof Map) || this.size !== another.size) {
      return true
    }
    for (var key of another.keys()) {
      if (!this.has(key)) {
        return true
      }
    }
    return false
  })

  // the comparison of two maps only counts on keys too.
  link(proto, 'compares-to', function (another) {
    if (this === another) {
      return 0
    }
    if (!(another instanceof Map)) {
      return null
    }
    var reverse = another.size > this.size
    var a = reverse ? another : this
    var b = reverse ? this : another
    for (var key of b.keys()) {
      if (!a.has(key)) {
        return null
      }
    }
    return a.size === b.size ? 0
      : reverse ? -1 : 1
  })

  link(proto, 'is-empty', function () {
    return !(this.size > 0)
  })
  link(proto, 'not-empty', function () {
    return this.size > 0
  })

  var toCode = link(proto, 'to-code', function (printing) {
    var ctx
    if (printing instanceof EncodingContext$) {
      ctx = printing
      var sym = ctx.begin(this)
      if (sym) { return sym }
    } else {
      ctx = new EncodingContext$(this, printing)
    }
    var code = [symbolLiteral, symbolPairing, symbolMap]
    var first = true
    this.forEach(function (value, key) {
      first ? (first = false) : ctx.printing && code.push(symbolComma)
      code.push(ctx.encode(key), symbolPairing, ctx.encode(value))
    })
    return ctx.end(this, Type, new Tuple$(code))
  })

  // Description
  link(proto, 'to-string', function () {
    return thisCall(toCode.call(this, true), 'to-string')
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/null.js":
/*!****************************!*\
  !*** ./es/generic/null.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function nullIn ($void) {
  var Null = $void.null
  var link = $void.link
  var Symbol$ = $void.Symbol

  // Fundamental Entity Relationships: Identity, Equivalence and Ordering
  // Identity, Equivalence and Ordering logics must be symmetrical.
  // An identity must be equivalent with itself.
  // Ordering Equal must comply with Equivalence Equal.

  link(Null, [
    // Identity: to recognize two different entities.
    'is', '===',
    // Equivalence: to test if two entities are equivalent in effect.
    // Equivalence logic should be implemented symmetrically.
    // So it's different with the behavior of NaN in JS, since an identity must be
    // equivalent in effect with itself, or as an identity's behavior cannot be
    // defined by any property that's irrelevant with its effect to its environment.
    'equals', '=='
  ], function (another) {
    return Object.is(typeof this === 'undefined' ? null : this,
      typeof another === 'undefined' ? null : another)
  })
  link(Null, [
    // the negative method of Identity test.
    'is-not', '!==',
    // the negative method of Equivalence test.
    'not-equals', '!='
  ], function (another) {
    return !Object.is(typeof this === 'undefined' ? null : this,
      typeof another === 'undefined' ? null : another)
  })

  // Ordering: general comparison
  //     0 - identical
  //     1 - from this to another is descending.
  //    -1 - from this to another is ascending.
  //  null - not-sortable
  link(Null, 'compares-to', function (another) {
    return Object.is(this, typeof another === 'undefined' ? null : another)
      ? 0 : null
  })

  // Emptiness: null, type.proto and all prototypes are empty.
  link(Null, 'is-empty', function () {
    return true
  })
  link(Null, 'not-empty', function () {
    return false
  })

  // Type Verification: to test if an entity is an instance of a type.
  link(Null, ['is-a', 'is-an'], function (type) {
    // null is null and null is a null.
    // type.proto is not null but is a null.
    return typeof type === 'undefined' || type === null
  })
  link(Null, ['is-not-a', 'is-not-an'], function (type) {
    return typeof type !== 'undefined' && type !== null
  })

  // Encoding
  link(Null, 'to-code', function () {
    return this
  })

  // Representation (static values) or Description (non-static values)
  link(Null, 'to-string', function () {
    return 'null'
  })

  // Indexer
  link(Null, ':', function (index) {
    return typeof index === 'string' ? Null[index]
      : index instanceof Symbol$ ? Null[index.key] : null
  })
}


/***/ }),

/***/ "./es/generic/number.js":
/*!******************************!*\
  !*** ./es/generic/number.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function createValueOf ($void, parse, parseInteger) {
  return function (input, defaultValue) {
    var value
    if (typeof input === 'string') {
      value = input.startsWith('0x') || input.startsWith('0b')
        ? parseInteger(input)
        : parse(input)
    } else if (typeof input === 'boolean') {
      value = input ? 1 : 0
    } else if (input instanceof Date) {
      value = input.getTime()
    } else if (typeof input === 'undefined' || input === null) {
      value = 0
    } else if (typeof input === 'number') {
      value = input
    } else {
      value = NaN
    }
    return isNaN(value) && typeof defaultValue === 'number' ? defaultValue
      : value
  }
}

function safeIntValueOf (number) {
  var intValue = Number.isSafeInteger(number) ? number
    : isNaN(number) ? 0
      : number >= Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER
        : number <= Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER
          : Math.trunc(number)
  return intValue === 0 ? 0 : intValue
}

function createIntValueOf ($void, parse) {
  return function (input, defaultValue) {
    var result
    if (typeof input === 'string') {
      result = parse(input)
    } else if (typeof input === 'number') {
      result = input === 0 ? 0 : Math.trunc(input)
    } else if (typeof input === 'boolean') {
      return input ? 1 : 0
    }
    return Number.isSafeInteger(result) ? result
      : Number.isSafeInteger(defaultValue) ? defaultValue
        : safeIntValueOf(result)
  }
}

function createIntParser ($void) {
  return function (input) {
    var value
    if (typeof input !== 'string') {
      return typeof input !== 'number' ? NaN
        : input === 0 ? 0 : isNaN(input) ? NaN
          : (value = Math.trunc(input)) === 0 ? 0
            : Number.isSafeInteger(value) ? value : NaN
    }
    var radix
    if (input.startsWith('0x')) {
      radix = 16
      input = input.substring(2)
    } else if (input.startsWith('0b')) {
      radix = 2
      input = input.substring(2)
    } else if (input.length > 1 && input.startsWith('0')) {
      radix = 8
      input = input.substring(1)
    } else {
      radix = 10
      var offset = input.indexOf('.')
      if (offset >= 0) {
        input = input.substr(0, offset)
      }
    }
    value = parseInt(input, radix)
    return value === 0 ? 0
      : input.endsWith('i') ? value >> 0
        : Number.isSafeInteger(value) ? value : NaN
  }
}

function numberAnd (valueOf) {
  return function () {
    var result = this
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i]
      result += typeof arg === 'number' ? arg : valueOf(arg)
    }
    return result
  }
}

function numberSubtract (valueOf) {
  return function () {
    var result = this
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i]
      result -= typeof arg === 'number' ? arg : valueOf(arg)
    }
    return result
  }
}

function numberTimes (valueOf) {
  return function () {
    var result = this
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i]
      result *= typeof arg === 'number' ? arg : valueOf(arg)
    }
    return result
  }
}

function numberDivide (valueOf) {
  return function () {
    var result = this
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i]
      result /= typeof arg === 'number' ? arg : valueOf(arg)
    }
    return result
  }
}

function normalize (value) {
  return value >= 0 ? Math.trunc(value) : (0x100000000 + (value >> 0))
}

module.exports = function numberIn ($void) {
  var $ = $void.$
  var Type = $.number
  var $Range = $.range
  var link = $void.link
  var Symbol$ = $void.Symbol
  var bindThis = $void.bindThis
  var copyType = $void.copyType
  var protoValueOf = $void.protoValueOf

  // the value range and constant values.
  copyType(Type, Number, {
    MAX_VALUE: 'max',
    MIN_VALUE: 'smallest',
    MAX_SAFE_INTEGER: 'max-int',
    MIN_SAFE_INTEGER: 'min-int',
    POSITIVE_INFINITY: 'infinite',
    NEGATIVE_INFINITY: '-infinite'
  })
  link(Type, 'min', -Number.MAX_VALUE)

  // support bitwise operations for 32-bit integer values.
  link(Type, 'bits', 32)
  var maxBits = link(Type, 'max-bits', 0x7FFFFFFF)
  var minBits = link(Type, 'min-bits', 0x80000000 >> 0)

  // The empty value
  link(Type, 'empty', 0)

  // An empty value indicating an invalid number.
  link(Type, 'invalid', NaN)

  // parse a string to its number value.
  var regexParse = /\s*\(number\s+(invalid|[-]?infinite)\s*\)\s*/
  var parse = link(Type, 'parse', function (value) {
    if (typeof value !== 'string') {
      return typeof value === 'number' ? value : NaN
    }
    var keys = value.match(regexParse)
    switch (keys && keys.length > 1 ? keys[1] : '') {
      case 'invalid':
        return NaN
      case 'infinite':
        return Number.POSITIVE_INFINITY
      case '-infinite':
        return Number.NEGATIVE_INFINITY
      default:
        return parseFloat(value)
    }
  }, true)

  // parse a string as an integer value.
  var parseInteger = link(Type, 'parse-int', createIntParser($void), true)

  // get a number value from the input
  var valueOf = $void.numberValueOf = createValueOf($void, parse, parseInteger)
  link(Type, 'of', bindThis(Type, valueOf), true)

  // get an integer value from the input
  var intOf = $void.intValueOf = createIntValueOf($void, parseInteger)
  link(Type, 'of-int', bindThis(Type, intOf), true)

  // get an signed integer value which is stable with bitwise operation.
  link(Type, 'of-bits', function (input) {
    return intOf(input) >> 0
  }, true)

  var proto = Type.proto
  // test for special values
  link(proto, 'is-valid', function () {
    return !isNaN(this)
  })
  link(proto, 'is-invalid', function () {
    return isNaN(this)
  })
  // test for special value ranges
  link(proto, 'is-finite', function () {
    return isFinite(this)
  })
  link(proto, 'is-infinite', function () {
    return !isFinite(this)
  })
  link(proto, 'is-int', function () {
    return Number.isSafeInteger(this) && (this !== 0 || 1 / this === Infinity)
  })
  link(proto, 'is-not-int', function () {
    return !Number.isSafeInteger(this) || (this === 0 && 1 / this !== Infinity)
  })
  link(proto, 'is-bits', function () {
    return Number.isSafeInteger(this) &&
      this >= minBits && this <= maxBits &&
      (this !== 0 || 1 / this === Infinity)
  })
  link(proto, 'is-not-bits', function () {
    return !Number.isSafeInteger(this) ||
      this < minBits || this > maxBits ||
      (this === 0 && 1 / this !== Infinity)
  })

  // convert to special sub-types
  link(proto, 'as-int', function () {
    return safeIntValueOf(this)
  })
  link(proto, 'as-bits', function () {
    return this >> 0
  })

  // helpers of zero-based indexing.
  link(proto, ['th', 'st', 'nd', 'rd'], function () {
    var index = safeIntValueOf(this)
    return index >= 0 ? (index - 1) : index
  })

  // support basic arithmetic operations
  link(proto, ['+', 'plus'], numberAnd(valueOf))
  link(proto, ['-', 'minus'], numberSubtract(valueOf))
  link(proto, ['*', 'times'], numberTimes(valueOf))
  link(proto, ['/', 'divided-by'], numberDivide(valueOf))

  // remainder / modulus
  link(proto, '%', function (base) {
    return typeof base === 'undefined' ? this
      : typeof base !== 'number' || isNaN(base) ? NaN
        : isFinite(base) ? this % valueOf(base) : this
  })

  // bitwise operations
  link(proto, '&', function (value) {
    return this & (typeof value === 'number' ? value : valueOf(value))
  })
  link(proto, '|', function (value) {
    return this | (typeof value === 'number' ? value : valueOf(value))
  })
  link(proto, '^', function (value) {
    return this ^ (typeof value === 'number' ? value : valueOf(value))
  })
  link(proto, '<<', function (offset) {
    return this << (typeof offset === 'number' ? offset : intOf(offset))
  })
  // signed right-shift.
  link(proto, '>>', function (offset) {
    return this >> (typeof offset === 'number' ? offset : intOf(offset))
  })
  // zero-based right shift.
  link(proto, '>>>', function (offset) {
    return this >>> (typeof offset === 'number' ? offset : intOf(offset))
  })

  // support ordering logic - comparable
  // For incomparable entities, comparison result is consistent with the Equivalence.
  // incomparable state is indicated by a null and is taken as nonequivalent.
  var comparesTo = link(proto, 'compares-to', function (another) {
    return typeof another !== 'number' ? null
      : this === another ? 0 // two same valid values.
        : !isNaN(this) && !isNaN(another)
          ? this > another ? 1 : -1
          : isNaN(this) && isNaN(another)
            ? 0 // NaN is equivalent with itself.
            : null // NaN is not comparable with a real number.
  })

  // comparing operators for instance values
  link(proto, '>', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order > 0 : null
  })
  link(proto, '>=', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order >= 0 : null
  })
  link(proto, '<', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order < 0 : null
  })
  link(proto, '<=', function (another) {
    var order = comparesTo.call(this, another)
    return order !== null ? order <= 0 : null
  })

  // override equivalence logic since 0 != -0 by identity-base test.
  link(proto, ['equals', '=='], function (another) {
    return typeof another === 'number' && (
      this === another || (isNaN(this) && isNaN(another))
    )
  })
  link(proto, ['not-equals', '!='], function (another) {
    return typeof another !== 'number' || (
      this !== another && !(isNaN(this) && isNaN(another))
    )
  })

  // support common math operations
  link(proto, 'ceil', function () {
    return Math.ceil(this)
  })
  link(proto, 'floor', function () {
    return Math.floor(this)
  })
  link(proto, 'round', function () {
    return Math.round(this)
  })
  link(proto, 'trunc', function () {
    return Math.trunc(this)
  })

  // O and NaN are defined as empty.
  link(proto, 'is-empty', function () {
    return this === 0 || isNaN(this)
  })
  link(proto, 'not-empty', function () {
    return this !== 0 && !isNaN(this)
  })

  // Representation & Description
  link(proto, 'to-string', function (format) {
    if (isNaN(this)) {
      return '(number invalid)'
    } else if (this === Number.POSITIVE_INFINITY) {
      return '(number infinite)'
    } else if (this === Number.NEGATIVE_INFINITY) {
      return '(number -infinite)'
    } else if (!format) {
      return Object.is(this, -0) ? '-0' : this.toString()
    }

    switch (format) {
      case 'H':
      case 'HEX':
        return normalize(this).toString(16)
      case 'h':
      case 'hex':
        return '0x' + normalize(this).toString(16)
      case 'O':
      case 'OCT':
        return normalize(this).toString(8)
      case 'o':
      case 'oct':
        return '0' + normalize(this).toString(8)
      case 'B':
      case 'BIN':
        return normalize(this).toString(2)
      case 'b':
      case 'bin':
        return '0b' + normalize(this).toString(2)
      default:
        return this.toString()
    }
  })

  // Indexer
  var indexer = link(proto, ':', function (index, value) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : typeof index === 'number' ? $Range.of(this, index, value)
        : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/object.js":
/*!******************************!*\
  !*** ./es/generic/object.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function objectIn ($void) {
  var $ = $void.$
  var Type = $.object
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var link = $void.link
  var Symbol$ = $void.Symbol
  var Object$ = $void.Object
  var isObject = $void.isObject
  var thisCall = $void.thisCall
  var ClassType$ = $void.ClassType
  var ownsProperty = $void.ownsProperty
  var protoValueOf = $void.protoValueOf
  var encodeFieldName = $void.encodeFieldName
  var EncodingContext$ = $void.EncodingContext

  var symbolComma = $Symbol.comma
  var symbolLiteral = $Symbol.literal
  var symbolPairing = $Symbol.pairing

  // create an empty object.
  var createObject = link(Type, 'empty', Object.create.bind(Object, Type.proto))

  // create a new object and copy fields from source objects.
  link(Type, 'of', function () {
    var len = arguments.length
    if (len < 1) {
      return createObject()
    }
    var args = [createObject()]
    for (var i = 0; i < len; i++) {
      isObject(arguments[i]) && args.push(arguments[i])
    }
    return Object.assign.apply(Object, args)
  }, true)

  // JS-InterOp: create a generic object and copy fields from source objects.
  link(Type, 'of-generic', function () {
    if (arguments.length < 1) {
      return {}
    }
    // using native Object.assign; not filtering source types.
    var args = Array.prototype.slice.call(arguments)
    args.unshift({})
    return Object.assign.apply(Object, args)
  }, true)

  // JS-InterOp: test if an object is a generic object.
  link(Type, 'is-generic', function (obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype
  }, true)
  link(Type, 'not-generic', function (obj) {
    return !isObject(obj) || Object.getPrototypeOf(obj) !== Object.prototype
  }, true)

  // JS-InterOp:  create a generic object and copy fields from source objects.
  link(Type, 'of-plain', function () {
    if (arguments.length < 1) {
      return Object.create(null)
    }
    // using native Object.assign, not filtering source types.
    var args = Array.prototype.slice.call(arguments)
    args.unshift(Object.create(null))
    return Object.assign.apply(Object, args)
  }, true)

  // JS-InterOp: test if an object is a generic plain object.
  link(Type, 'is-plain', function (obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) === null
  }, true)
  link(Type, 'not-plain', function (obj) {
    return !isObject(obj) || Object.getPrototypeOf(obj) !== null
  }, true)

  // copy fields from source objects to the target object
  link(Type, 'assign', function (target) {
    if (isObject(target)) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]
        if (source instanceof Object$) {
          Object.assign(target, source)
        }
      }
      return target
    }
    return null
  }, true)

  // get the value of a field.
  link(Type, 'get', function (obj, name, value) {
    if (name instanceof Symbol$) {
      name = name.key
    } else if (typeof name !== 'string') {
      return value
    }
    var pValue
    return !isObject(obj) ? value
      : ownsProperty(obj, name)
        ? typeof obj[name] === 'undefined' ? value : obj[name]
        : typeof (pValue = protoValueOf(obj, obj, name)) === 'undefined'
          ? value : pValue
  }, true)
  // set the value of a field.
  link(Type, 'set', function (obj, name, value) {
    if (name instanceof Symbol$) {
      name = name.key
    } else if (typeof name !== 'string') {
      return null
    }
    return !isObject(obj) ? null
      : (obj[name] = (typeof value !== 'undefined' ? value : null))
  }, true)
  // remove a field.
  link(Type, 'reset', function (obj, name, more) {
    if (!isObject(obj)) {
      return 0
    }
    if (typeof more === 'undefined') {
      if (name instanceof Symbol$) {
        name = name.key
      }
      return typeof name !== 'string' ? 0
        : delete obj[name] ? 1 : 0
    }
    var i = 1
    var counter = 0
    do {
      if (typeof name === 'string') {
        (delete obj[name]) && counter++
      } else if (name instanceof Symbol$) {
        (delete obj[name.key]) && counter++
      }
      name = arguments[++i]
    } while (i < arguments.length)
    return counter
  }, true)

  // make a copy with selected or all fields.
  link(Type, 'copy', function (src, fields) {
    if (!isObject(src)) {
      return null
    }
    var obj = Object.create(src.type.proto)
    var names = arguments.length > 1
      ? Array.prototype.slice.call(arguments, 1)
      : Object.getOwnPropertyNames(src)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (name instanceof Symbol$) {
        name = name.key
      }
      if (typeof name === 'string') {
        obj[name] = src[name]
      }
    }
    var activator = src.type.proto.activator
    if (typeof activator === 'function') {
      activator.call(obj, obj)
    }
    return obj
  }, true)
  // remove given or all fields.
  link(Type, 'clear', function (obj, fields) {
    if (!isObject(obj)) {
      return null
    }
    var names = arguments.length > 1
      ? Array.prototype.slice.call(arguments, 1)
      : Object.getOwnPropertyNames(obj)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (typeof name === 'string') {
        delete obj[name]
      } else if (name instanceof Symbol$) {
        delete obj[name.key]
      }
    }
    return obj
  }, true)
  // remove one or more values to create a new object.
  link(Type, 'remove', function (src, fields) {
    if (!isObject(src)) {
      return null
    }
    var obj = Object.assign(Object.create(src.type.proto), src)
    var names = arguments.length <= 1 ? []
      : Array.prototype.slice.call(arguments, 1)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (typeof name === 'string') {
        delete obj[name]
      } else if (name instanceof Symbol$) {
        delete obj[name.key]
      } else if (name instanceof Object$) {
        fields = Object.getOwnPropertyNames(name)
        for (var j = 0; j < fields.length; j++) {
          delete obj[fields[j]]
        }
      }
    }
    var activator = src.type.proto.activator
    if (typeof activator === 'function') {
      activator.call(obj, obj)
    }
    return obj
  }, true)

  // check the existence of a property
  link(Type, 'has', function (obj, name) {
    if (typeof name !== 'string') {
      if (name instanceof Symbol$) {
        name = name.key
      } else {
        return false
      }
    }
    return isObject(obj) && typeof obj[name] !== 'undefined'
  }, true)
  // check the existence of a field
  link(Type, 'owns', function (obj, name) {
    if (typeof name !== 'string') {
      if (name instanceof Symbol$) {
        name = name.key
      } else {
        return false
      }
    }
    return isObject(obj) && ownsProperty(obj, name)
  }, true)
  // retrieve field names.
  link(Type, 'fields-of', function (obj) {
    return isObject(obj) ? Object.getOwnPropertyNames(obj) : []
  }, true)

  // Mutability
  link(Type, 'seal', function (obj) {
    return typeof obj === 'undefined' ? Type // operating on the type
      : isObject(obj) || Array.isArray(obj) ? Object.freeze(obj) : null
  })
  link(Type, 'is-sealed', function (obj) {
    return typeof obj === 'undefined' ? true // asking the type
      : isObject(obj) || Array.isArray(obj) ? Object.isFrozen(obj) : false
  })

  var proto = Type.proto
  // generate an iterator function to traverse all fields as [name, value].
  link(proto, 'iterate', function () {
    var fields = Object.getOwnPropertyNames(this)
    var obj = this
    var current = null
    var next = 0
    var field
    return function (inSitu) {
      return current !== null && inSitu === true ? current // cached current value
        : next >= fields.length ? null // no more
          : (current = [(field = fields[next++]), obj[field]])
    }
  })

  // Type Verification
  link(proto, ['is-a', 'is-an'], function (t) {
    return t === Type
  })
  link(proto, ['is-not-a', 'is-not-an'], function (t) {
    return t !== Type
  })

  // default object emptiness logic
  link(proto, 'is-empty', function () {
    return !(Object.getOwnPropertyNames(this).length > 0)
  })
  link(proto, 'not-empty', function () {
    return Object.getOwnPropertyNames(this).length > 0
  })

  // Encoding
  // encoding logic for all object instances.
  var typeOf = $.type.of
  var toCode = link(proto, 'to-code', function (printing) {
    var ctx
    if (printing instanceof EncodingContext$) {
      ctx = printing
      var sym = ctx.begin(this)
      if (sym) { return sym }
    } else {
      ctx = new EncodingContext$(this, printing)
    }
    var props = Object.getOwnPropertyNames(this)
    var code = [symbolLiteral]
    var first = true
    for (var i = 0; i < props.length; i++) {
      first ? (first = false) : ctx.printing && code.push(symbolComma)
      var name = props[i]
      code.push(encodeFieldName(name), symbolPairing, ctx.encode(this[name]))
    }
    if (code.length < 2) {
      code.push(symbolPairing) // (@:) for empty object
    }
    var type = this.type instanceof ClassType$ ? this.type : typeOf(this)
    return ctx.end(this, type, new Tuple$(code))
  })

  // Description
  link(proto, 'to-string', function () {
    return thisCall(toCode.call(this, true), 'to-string')
  })

  // Indexer:
  var indexer = link(proto, ':', function (index, value) {
    if (typeof index !== 'string') {
      if (index instanceof Symbol$) {
        index = index.key // use the key of a symbol
      } else {
        return null // unsupported property key.
      }
    }
    return typeof value === 'undefined'
      ? typeof proto[index] === 'undefined' || index === 'type'
        ? this[index] : protoValueOf(this, proto, index) // getting
      : (this[index] = value) // setting
  })
  indexer.get = function (key) {
    return typeof proto[key] === 'undefined' || key === 'type'
      ? this[key] : proto[key] // getting
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/operator.js":
/*!********************************!*\
  !*** ./es/generic/operator.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function operatorIn ($void) {
  var $ = $void.$
  var Type = $.operator
  var $Tuple = $.tuple
  var link = $void.link
  var prepareOperation = $void.prepareOperation

  // the noop operator
  var noop = link(Type, 'noop', $void.operator(function () {
    return null
  }, $Tuple.operator), true)

  // implement common operation features.
  prepareOperation(Type, noop, $Tuple.operator)
}


/***/ }),

/***/ "./es/generic/promise.js":
/*!*******************************!*\
  !*** ./es/generic/promise.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

module.exports = function promiseIn ($void) {
  var $ = $void.$
  var Type = $.promise
  var $Tuple = $.tuple
  var $Object = $.object
  var $Symbol = $.symbol
  var Symbol$ = $void.Symbol
  var Promise$ = $void.Promise
  var link = $void.link
  var $export = $void.export
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf

  function ignoreUnhandledRejectionsBy (filter) {
    if ($void.isNativeHost) {
      process.on('unhandledRejection', filter)
    } else {
      window.addEventListener('unhandledrejection', function (event) {
        filter(event.reason, event.promise) && event.preventDefault()
      })
    }
  }

  function hasExcuse (excuse) {
    return typeof excuse !== 'undefined' && excuse !== null
  }

  // use true to make sure it's not a boolean false by default.
  var NoExcuse = true
  function safeExcuse (excuse, waiting) {
    return hasExcuse(excuse) ? excuse
      : waiting && hasExcuse(waiting.excuse) ? waiting.excuse : NoExcuse
  }

  function assemble (promise, cancel) {
    if (promise.excusable !== true) {
      promise.excusable = true
    }
    if (isApplicable(cancel)) {
      promise.$cancel = cancel
    }
    return promise
  }

  function promiseOfAsync (async) {
    var cancel
    var promise = new Promise$(function (resolve, reject) {
      cancel = async(Object.freeze($Object.of({
        resolve: resolve,
        reject: reject
      })))
    })
    return assemble(promise, cancel)
  }

  function promiseOfExecutor (executor) {
    var cancel
    var promise = new Promise$(function (resolve, reject) {
      cancel = executor(resolve, reject)
    })
    return assemble(promise, cancel)
  }

  function resolvedTo (next, result) {
    return next(Object.freeze($Object.of({
      result: result
    })))
  }

  function rejectedTo (next, excuse) {
    return next(Object.freeze($Object.of({
      excuse: safeExcuse(excuse)
    })))
  }

  function staticPromiseOf (result) {
    var value
    return assemble(!Array.isArray(result)
      // intercept a non-array value as an excuse. Otherwise,
      ? (value = safeExcuse(result)) === NoExcuse ? nothing
        : Promise$.reject(value)
      // reject if any excuse exists. Otherwise,
      : hasExcuse((value = result[1])) ? Promise$.reject(value)
        // resolve even the final result value is null.
        : ((value = result[0]) === undefined || value === null) ? empty
          : Promise$.resolve(value)
    )
  }

  function makePromise (promising, isExecutor) {
    return promising instanceof Promise$ ? assemble(promising)
      : !isApplicable(promising) ? staticPromiseOf(promising)
        : isExecutor ? promiseOfExecutor(promising)
          : promiseOfAsync(promising)
  }

  function wrapStepResult (result, waiting) {
    return function (resolve, reject) {
      // any non-array result will be intercepted as an excuse
      !Array.isArray(result) ? reject(safeExcuse(result, waiting))
        // finally reject if any excuse exists. Otherwise,
        : hasExcuse(result[1]) ? reject(result[1])
          // resolve even the final result value is null.
          : resolve(result[0] === undefined ? null : result[0])
    }
  }

  function rejectWith (safeExcuse) {
    return function (resolve, reject) {
      reject(safeExcuse)
    }
  }

  function wrap (step) {
    return isApplicable(step) ? function (waiting) {
      // let a step function to decide if it forgives an existing excuse.
      var result = step.apply(null, arguments)
      return result instanceof Promise$ // continue and
        ? result.then.bind(result) // forward final promise's result.
        : isApplicable(result) // continue too, and
          // generate a final promise and forward its result.
          ? (result = makePromise(result)).then.bind(result)
          // other value will be intercepted as a sync step result.
          : wrapStepResult(result, waiting)
    } : function (waiting) {
      // any value other than a promise or an function will be intercepted as
      // a sync step result.
      return waiting && hasExcuse(waiting.excuse)
        ? rejectWith(waiting.excuse)
        : wrapStepResult(step)
    }
  }

  function awaitFor (promise, next) {
    return function (resolve, reject) {
      promise.then(function (result) {
        resolvedTo(next, result)(resolve, reject)
      }, function (excuse) {
        rejectedTo(next, excuse)(resolve, reject)
      })
    }
  }

  function compose (promise, next) {
    return function (waiting) {
      return waiting && hasExcuse(waiting.excuse)
        // the overall promise will reject immediately if found an tolerated
        // rejection, since a parallel promise cannot react to it.
        ? rejectWith(waiting.excuse)
        // otherwise, the current promise's result will be taken into account in turn.
        : awaitFor(promise, next)
    }
  }

  function connect (step, next) {
    return function (waiting) {
      var result = step.apply(null, arguments)
      return result instanceof Promise$
        // a step function may return another promise, or
        ? awaitFor(result, next)
        // return a new promisee function to generate a promise.
        : isApplicable(result) ? awaitFor(makePromise(result), next)
          // any value other than a sync step result will be intercepted as
          // the excuse of a final rejection.
          : !Array.isArray(result) ? rejectWith(safeExcuse(result, waiting))
            // a sync step result will be relayed literally, so it may have
            // any number of values in theory.
            : function (resolve, reject) {
              next.apply(null, result)(resolve, reject)
            }
    }
  }

  function makePromises (promises) {
    if (!Array.isArray(promises)) {
      promises = []
    }
    for (var i = 0; i < promises.length; i++) {
      promises[i] = makePromise(promises[i])
    }
    return promises
  }

  // the empty value which has been resolved to null.
  var empty = link(Type, 'empty', Promise$.resolve(null))

  // guard espresso promises to ignore unhandled rejections.
  ignoreUnhandledRejectionsBy(function (excuse, promise) {
    // TODO: create warnings
    return promise.excusable === true
  })

  // another special value which has been rejected.
  var nothing = link(Type, 'nothing', Promise$.reject(NoExcuse))
  // catch the rejection of nothing.
  nothing.catch(function () {})

  // To make a promise from one or more promisee functions and/or other promises.
  // It's is fulfilled when all promise handlers have been invoked sequentially.
  var noop = function () { return this }
  $export($, 'commit', link(Type, 'of', function (promising, next) {
    var last = arguments.length - 1
    next = last > 0 ? wrap(arguments[last]) : null
    for (var i = last - 1; i > 0; i--) {
      var current = arguments[i]
      if (!isApplicable(current)) {
        current = noop.bind(current)
      }
      next = connect(current, next)
    }
    promising = typeof promising === 'undefined' || promising === null
      ? nothing : makePromise(promising)
    return next ? makePromise(compose(promising, next)(), true) : promising
  }, true))

  // to make a resolved promise for a value.
  link(Type, 'of-resolved', function (result) {
    return typeof result === 'undefined' || result === null ? empty
      : assemble(Promise$.resolve(result))
  }, true)

  // to make a rejected promise with a cause.
  link(Type, 'of-rejected', function (excuse) {
    excuse = safeExcuse(excuse)
    return excuse === NoExcuse ? nothing
      : assemble(Promise$.reject(excuse))
  }, true)

  // To make a promise from one or more promisee functions and/or other promises.
  // It's is fulfilled when all promise handlers have been invoked separately.
  $export($, 'commit*', link(Type, 'of-all', function (promising) {
    var promises = makePromises(Array.prototype.slice.call(arguments))
    return promises.length > 0 ? assemble(Promise$.all(promises)) : empty
  }, true))

  // the array argument version of (promise of-all promising, ...)
  link(Type, 'all', function (promisingList) {
    if (!Array.isArray(promisingList)) {
      return empty
    }
    var promises = makePromises(promisingList)
    return promises.length > 0 ? assemble(Promise$.all(promises)) : empty
  }, true)

  // To make a promise from one or more promisee functions and/or other promises.
  // It's is fulfilled when any one of them is fulfilled.
  $export($, 'commit?', link(Type, 'of-any', function (promising) {
    var promises = makePromises(Array.prototype.slice.call(arguments))
    return promises.length > 1 ? assemble(Promise$.race(promises))
      : promises.length > 0 ? promises[0] : nothing
  }, true))

  // the array argument version of (promise of-any promising, ...)
  link(Type, 'any', function (promisingList) {
    if (!Array.isArray(promisingList)) {
      return nothing
    }
    var promises = makePromises(promisingList)
    return promises.length > 1 ? assemble(Promise$.race(promises))
      : promises.length > 0 ? promises[0] : nothing
  }, true)

  var proto = Type.proto
  // the optional cancellation capability of a promise.
  link(proto, 'is-cancellable', function () {
    return isApplicable(this.$cancel)
  })
  // try to cancel the promised operation.
  link(proto, 'cancel', function () {
    // a cancel function should be ready for being called multiple times.
    return isApplicable(this.$cancel) ? this.$cancel.apply(this, arguments) : null
  })

  // the next step after this promise has been either resolved or rejected.
  // this returns a new promise or this (only when step is missing).
  link(proto, 'then', function (step) {
    return typeof step === 'undefined' ? this
      : makePromise(awaitFor(this, wrap(step)), true)
  })

  // the last step after this promise has been either resolved or rejected.
  // this returns current promise
  link(proto, 'finally', function (waiter) {
    if (isApplicable(waiter)) {
      this.then(
        resolvedTo.bind(null, waiter),
        rejectedTo.bind(null, waiter)
      )
    }
    return this
  })

  // range is empty if it cannot iterate at least once.
  link(proto, 'is-empty', function () {
    return this === empty || this === nothing
  })
  link(proto, 'not-empty', function () {
    return this !== empty && this !== nothing
  })

  // Encoding
  var symbolPromise = sharedSymbolOf('promise')
  var emptyPromise = $Tuple.of(symbolPromise, sharedSymbolOf('empty'))
  var nothingPromise = $Tuple.of(symbolPromise, sharedSymbolOf('nothing'))
  var otherPromise = $Tuple.of(symbolPromise, sharedSymbolOf('of'), $Symbol.etc)
  var toCode = link(proto, 'to-code', function () {
    return this === empty ? emptyPromise
      : this === nothing ? nothingPromise
        : otherPromise
  })

  // Description
  link(proto, 'to-string', function () {
    return toCode.call(this)['to-string']()
  })

  // Indexer
  var indexer = link(proto, ':', function (index, value) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./es/generic/range.js":
/*!*****************************!*\
  !*** ./es/generic/range.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function rangeIn ($void) {
  var $ = $void.$
  var Type = $.range
  var Range$ = $void.Range
  var Symbol$ = $void.Symbol
  var link = $void.link
  var protoValueOf = $void.protoValueOf

  // the empty value
  link(Type, 'empty', new Range$(0, 0, 1))

  // create a range
  link(Type, 'of', function (begin, end, step) {
    if (begin instanceof Range$) {
      return begin // null op for the same type.
    }
    if (typeof begin !== 'number' || isNaN(begin) || !isFinite(begin)) {
      begin = 0
    }
    if (typeof end === 'undefined') {
      end = begin
      begin = 0
    } else if (typeof end !== 'number' || isNaN(end) || !isFinite(end)) {
      end = 0
    }
    if (typeof step !== 'number' || isNaN(step) || !isFinite(step)) {
      step = 0
    }
    return new Range$(begin, end, step || (begin <= end ? 1 : -1))
  }, true)

  var proto = Type.proto

  link(proto, 'begin', function () {
    return this.begin
  })
  link(proto, 'end', function () {
    return this.end
  })
  link(proto, 'step', function () {
    return this.step
  })

  link(proto, 'count', function () {
    var diff = this.end - this.begin
    var count = Math.trunc(diff / this.step)
    var remainder = diff % this.step
    return count < 0 ? 0 : remainder ? count + 1 : count
  })

  // generate an iterator function
  link(proto, 'iterate', function () {
    var range = this
    var current = null
    var next = this.begin
    return function (inSitu) {
      if (current !== null && inSitu === true) {
        return current
      }
      if (range.step > 0 ? next >= range.end : next <= range.end) {
        return null
      }
      current = next; next += range.step
      return current
    }
  })

  // Identity and Equivalence: to be determined by field values.
  link(proto, ['is', '===', 'equals', '=='], function (another) {
    return this === another || (
      another instanceof Range$ &&
      this.begin === another.begin &&
      this.end === another.end &&
      this.step === another.step
    )
  })
  link(proto, ['is-not', '!==', 'not-equals', '!='], function (another) {
    return this !== another && (
      !(another instanceof Range$) ||
      this.begin !== another.begin ||
      this.end !== another.end ||
      this.step !== another.step
    )
  })

  // override comparison logic to keep consistent with Identity & Equivalence.
  link(proto, 'compares-to', function (another) {
    return this === another ? 0
      : !(another instanceof Range$) || this.step !== another.step ? null
        : this.step > 0
          ? this.begin < another.begin
            ? this.end >= another.end ? 1 : null
            : this.begin === another.begin
              ? this.end < another.end ? -1
                : this.end === another.end ? 0 : 1
              : this.end <= another.end ? -1 : null
          : this.begin > another.begin
            ? this.end <= another.end ? 1 : null
            : this.begin === another.begin
              ? this.end > another.end ? -1
                : this.end === another.end ? 0 : 1
              : this.end >= another.end ? -1 : null
  })

  // range is empty if it cannot iterate at least once.
  link(proto, 'is-empty', function () {
    return this.step > 0 ? this.begin >= this.end : this.begin <= this.end
  })
  link(proto, 'not-empty', function () {
    return this.step > 0 ? this.begin < this.end : this.begin > this.end
  })

  // Representation
  link(proto, 'to-string', function () {
    return '(' + [this.begin, this.end, this.step].join(' ') + ')'
  })

  // Indexer
  var indexer = link(proto, ':', function (index, value) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/set.js":
/*!***************************!*\
  !*** ./es/generic/set.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function setIn ($void) {
  var $ = $void.$
  var Type = $.set
  var $Array = $.array
  var $Symbol = $.symbol
  var $Iterator = $.iterator
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var link = $void.link
  var thisCall = $void.thisCall
  var boolValueOf = $void.boolValueOf
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf
  var EncodingContext$ = $void.EncodingContext
  var iterateOfGeneric = $void.iterateOfGeneric

  var symbolComma = $Symbol.comma
  var symbolLiteral = $Symbol.literal
  var symbolPairing = $Symbol.pairing
  var symbolSet = sharedSymbolOf('set')

  var iteratorOfGeneric = $Iterator['of-generic']

  // create an empty array.
  link(Type, 'empty', function () {
    return new Set()
  }, true)

  // create an array of the arguments
  link(Type, 'of', function (x, y, z) {
    return new Set(arguments)
  }, true)

  var setFrom = link(Type, 'from', function (src) {
    return arguments.length < 1 ? new Set()
      // keep the consistent concatenation logic with (array from)
      : new Set($Array.from.apply($Array, arguments))
  }, true)

  var proto = Type.proto
  link(proto, 'size', function () {
    return this.size
  })

  link(proto, 'has', function (value) {
    return this.has(value)
  })
  link(proto, 'contains', function (items) {
    if (!(items instanceof Set) && !Array.isArray(items)) {
      items = $Array.from(items)
    }
    for (var value of items) {
      if (!this.has(value)) {
        return false
      }
    }
    return true
  })

  link(proto, 'add', function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      this.add(arguments[i])
    }
    return this
  })
  link(proto, ['combines-with', 'combines', '+='], function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var items = arguments[i]
      if (!(items instanceof Set) && !Array.isArray(items)) {
        items = $Array.from(items)
      }
      for (var item of items) {
        this.add(item)
      }
    }
    return this
  })
  link(proto, ['merge', '+'], function () {
    var sources = Array.prototype.slice.call(arguments)
    sources.unshift(this)
    return setFrom.apply(Type, sources)
  })

  // delete separate elements
  link(proto, 'delete', function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      this.delete(arguments[i])
    }
    return this
  })
  // delete elements in other collection(s)
  link(proto, 'remove', function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var items = arguments[i]
      if (!(items instanceof Set) && !Array.isArray(items)) {
        items = $Array.from(items)
      }
      for (var item of items) {
        this.delete(item)
      }
    }
    return this
  })
  link(proto, 'clear', function () {
    this.clear()
    return this
  })

  link(proto, 'iterate', function () {
    return iterateOfGeneric(this.values())
  })
  link(proto, 'values', function () {
    return iteratorOfGeneric(this.values())
  })

  link(proto, 'copy', function () {
    return new Set(this)
  })

  // return the amount of elements.
  link(proto, ['count', 'for-each'], function (filter) {
    if (!isApplicable(filter)) {
      return this.size // keep consistency with array.
    }
    var counter = 0
    this.forEach(function (v, _, s) {
      boolValueOf(filter.call(s, v)) && counter++
    })
    return counter
  })

  link(proto, ['equals', '=='], function (another) {
    if (this === another) {
      return true
    }
    if (!(another instanceof Set) || this.size !== another.size) {
      return false
    }
    for (var item of another) {
      if (!this.has(item)) {
        return false
      }
    }
    return true
  })
  link(proto, ['not-equals', '!='], function (another) {
    if (this === another) {
      return false
    }
    if (!(another instanceof Set) || this.size !== another.size) {
      return true
    }
    for (var item of another) {
      if (!this.has(item)) {
        return true
      }
    }
    return false
  })

  link(proto, 'compares-to', function (another) {
    if (this === another) {
      return 0
    }
    if (!(another instanceof Set)) {
      return null
    }
    var reverse = another.size > this.size
    var a = reverse ? another : this
    var b = reverse ? this : another
    for (var item of b) {
      if (!a.has(item)) {
        return null
      }
    }
    return a.size === b.size ? 0
      : reverse ? -1 : 1
  })

  link(proto, 'is-empty', function () {
    return !(this.size > 0)
  })
  link(proto, 'not-empty', function () {
    return this.size > 0
  })

  // default object persistency & describing logic
  var toCode = link(proto, 'to-code', function (printing) {
    var ctx
    if (printing instanceof EncodingContext$) {
      ctx = printing
      var sym = ctx.begin(this)
      if (sym) { return sym }
    } else {
      ctx = new EncodingContext$(this, printing)
    }
    var code = [symbolLiteral, symbolPairing, symbolSet]
    var first = true
    for (var item of this) {
      first ? (first = false) : ctx.printing && code.push(symbolComma)
      code.push(ctx.encode(item))
    }
    return ctx.end(this, Type, new Tuple$(code))
  })

  // Description
  link(proto, 'to-string', function () {
    return thisCall(toCode.call(this, true), 'to-string')
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/string.js":
/*!******************************!*\
  !*** ./es/generic/string.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function stringIn ($void) {
  var $ = $void.$
  var Type = $.string
  var link = $void.link
  var Symbol$ = $void.Symbol
  var thisCall = $void.thisCall
  var protoValueOf = $void.protoValueOf

  // the empty value
  link(Type, 'empty', '')

  // generate a string from inputs.
  link(Type, 'of', function (value) {
    // return the empty value without an argument.
    if (typeof value === 'undefined') {
      return ''
    }
    // concat the trimmed values of strings and to-string results of non-strings.
    var result = []
    for (var i = 0; i < arguments.length; i++) {
      var str = arguments[i]
      if (typeof str !== 'string') {
        str = thisCall(str, 'to-string')
        if (typeof str !== 'string') {
          str = ''
        }
      }
      if (str) {
        result.push(str)
      }
    }
    return result.join('')
  }, true)

  // generate a string from a series of unicode values
  link(Type, 'of-chars', function () {
    return String.fromCharCode.apply(String, arguments)
  }, true)

  // generate the source code string for any value.
  link(Type, 'of-code', function (value) {
    return typeof value === 'undefined' ? ''
      : thisCall(thisCall(value, 'to-code'), 'to-string')
  }, true)

  var proto = Type.proto
  // return the length of this string.
  link(proto, 'length', function () {
    return this.length
  })

  // Searching
  // retrieve the first char.
  link(proto, 'first', function (count) {
    return typeof count === 'undefined'
      ? this.length > 0 ? this.charAt(0) : null
      : this.substr(0, count >> 0)
  })
  // try to find the index of the first occurrence of value.
  link(proto, 'first-of', function (value, from) {
    from >>= 0
    return this.indexOf(value, from < 0 ? from + this.length : from)
  })
  // retrieve the last char.
  link(proto, 'last', function (count) {
    return typeof count === 'undefined'
      ? this.length > 0 ? this.charAt(this.length - 1) : null
      : this.substr(Math.max(0, this.length - (count >>= 0)), count)
  })
  // retrieve the last char or the index of the last occurrence of value.
  link(proto, 'last-of', function (value, from) {
    return typeof value === 'undefined' ? -1
      : typeof value !== 'string' || !value ? this.length
        : this.lastIndexOf(value,
          (from = typeof from === 'undefined' ? this.length : from >> 0) < 0
            ? from + this.length : from
        )
  })

  link(proto, 'contains', function (str) {
    return typeof str === 'string' && (this.indexOf(str) >= 0)
  })
  link(proto, 'starts-with', function (prefix/*, ... */) {
    if (typeof prefix === 'string' && this.startsWith(prefix)) {
      return true
    }
    for (var i = 1, len = arguments.length; i < len; i++) {
      prefix = arguments[i]
      if (typeof prefix === 'string' && this.startsWith(prefix)) {
        return true
      }
    }
    return false
  })
  link(proto, 'ends-with', function (suffix/*, ... */) {
    if (typeof suffix === 'string' && this.endsWith(suffix)) {
      return true
    }
    for (var i = 0, len = arguments.length; i < len; i++) {
      suffix = arguments[i]
      if (typeof suffix === 'string' && this.endsWith(suffix)) {
        return true
      }
    }
    return false
  })

  // Converting
  // generate sub-string from this string.
  var copy = link(proto, 'copy', function (begin, count) {
    begin >>= 0
    count = typeof count === 'undefined' ? Infinity : count >> 0
    if (count < 0) {
      begin += count
      count = -count
    }
    if (begin < 0) {
      begin += this.length
      if (begin < 0) {
        count += begin
        begin = 0
      }
    }
    return this.substr(begin, count)
  })
  var slice = link(proto, 'slice', function (begin, end) {
    begin >>= 0
    if (begin < 0) {
      begin += this.length
      if (begin < 0) {
        begin = 0
      }
    }
    end = typeof end === 'undefined' ? this.length : end >> 0
    if (end < 0) {
      end += this.length
      if (end < 0) {
        end = 0
      }
    }
    return this.substr(begin, end - begin)
  })

  link(proto, 'trim', String.prototype.trim)
  link(proto, 'trim-left', String.prototype.trimLeft)
  link(proto, 'trim-right', String.prototype.trimRight)

  link(proto, 'replace', function (value, newValue) {
    return typeof value !== 'string' || !value ? this
      : this.replace(
        new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        typeof newValue === 'string' ? newValue : ''
      )
  })
  link(proto, 'to-upper', function (localized) {
    return localized === true ? this.toLocaleUpperCase() : this.toUpperCase()
  })
  link(proto, 'to-lower', function (localized) {
    return localized === true ? this.toLocaleLowerCase() : this.toLowerCase()
  })

  // combination and splitting of strings
  link(proto, ['concat', '+'], function () {
    var result = this ? [this] : []
    for (var i = 0; i < arguments.length; i++) {
      var str = arguments[i]
      if (typeof str !== 'string') {
        str = $void.thisCall(str, 'to-string')
        if (typeof str !== 'string') {
          str = ''
        }
      }
      if (str) {
        result.push(str)
      }
    }
    return result.join('')
  })
  // the reversed operation of '-':
  // if the argument value is a string, to removes a substring if it's the suffix.
  // if the argument value is a number, to removes a suffix with the length of this number.
  // other argument values will be converted to a string and to be removed as suffix.
  link(proto, '-', function () {
    if (this.length < 1 || arguments.length < 1) {
      return this
    }
    var result = this
    for (var i = arguments.length - 1; i >= 0; i--) {
      var value = arguments[i]
      if (typeof value === 'string') {
        if (result.endsWith(value)) {
          result = result.substring(0, result.length - value.length)
        }
      } else if (typeof value === 'number') {
        result = result.substring(0, result.length - value)
      } else {
        value = thisCall(value, 'to-string')
        if (typeof value !== 'string') {
          value = ''
        }
        if (value && result.endsWith(value)) {
          result = result.substring(0, result.length - value.length)
        }
      }
    }
    return result
  })
  link(proto, 'split', function (separator) {
    // to be symmetrical with join, replace a missing separator to a whitespace.
    return typeof separator === 'undefined' ? this.split(' ')
      // a non-string separator is interpreted as does-not-exist.
      : typeof separator !== 'string' ? [this]
        // a non-empty separator will be forwarded to native code.
        : separator ? this.split(separator)
          // replace default split('') to the safe version of splitting chars.
          // this is also kind of symmetry with join.
          : asChars.call(this)
  })

  // explicitly and safely convert a string to an array of chars
  var asChars = link(proto, 'as-chars', typeof Array.from === 'function' ? function () {
    return Array.from(this)
  } : function () {
    return this.length < 1 ? []
      // polyfill from Babel.
      : this.split(/(?=(?:[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/)
  })

  // get a character's unicode value by its offset in this string.
  link(proto, 'char-at', function (offset) {
    offset >>= 0
    var code = this.charCodeAt(offset < 0 ? offset + this.length : offset)
    return isNaN(code) ? null : code
  })

  // Ordering: override general comparison logic.
  link(proto, 'compares-to', function (another) {
    return typeof another !== 'string' ? null
      : this === another ? 0 : this > another ? 1 : -1
  })

  // comparing operators
  link(proto, '>', function (another) {
    return typeof another === 'string' ? this > another : null
  })
  link(proto, '>=', function (another) {
    return typeof another === 'string' ? this >= another : null
  })
  link(proto, '<', function (another) {
    return typeof another === 'string' ? this < another : null
  })
  link(proto, '<=', function (another) {
    return typeof another === 'string' ? this <= another : null
  })

  // the emptiness of string is determined by its length.
  link(proto, 'is-empty', function () {
    return this === ''
  })
  link(proto, 'not-empty', function () {
    return this !== ''
  })

  // Representation
  link(proto, 'to-string', function () {
    return JSON.stringify(this)
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key)
        : typeof index !== 'number' ? null
          : arguments.length > 1
            ? slice.apply(this, arguments) // chars in a range.
            : copy.apply(this, [index, 1])
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/symbol.js":
/*!******************************!*\
  !*** ./es/generic/symbol.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function symbolIn ($void) {
  var $ = $void.$
  var Type = $.symbol
  var $Tuple = $.tuple
  var $String = $.string
  var Symbol$ = $void.Symbol
  var link = $void.link
  var isSafeName = $void.isSafeName
  var isSafeSymbol = $void.isSafeSymbol
  var escapeSymbol = $void.escapeSymbol
  var protoValueOf = $void.protoValueOf

  var strComparesTo = $String.proto['compares-to']
  var strToString = $String.proto['to-string']

  // common symbol repository
  var sharedSymbols = $void.sharedSymbols
  var sharedSymbolOf = $void.sharedSymbolOf

  // the empty value.
  var empty = link(Type, 'empty', sharedSymbolOf(''))

  // a special symbol to indicate "etc." or "more" for parser and operator
  link(Type, 'etc', sharedSymbolOf('...'))

  // special symbols to indicate "all" and "any" for parsers and operators
  link(Type, 'all', sharedSymbolOf('*'))
  link(Type, 'any', sharedSymbolOf('?'))

  // symbols for common operators
  link(Type, 'quote', sharedSymbolOf('`'))

  link(Type, 'lambda', sharedSymbolOf('='))
  link(Type, 'stambda', sharedSymbolOf('->'))
  link(Type, 'function', sharedSymbolOf('=>'))
  link(Type, 'operator', sharedSymbolOf('=?'))

  link(Type, 'let', sharedSymbolOf('let'))
  link(Type, 'var', sharedSymbolOf('var'))
  link(Type, 'const', sharedSymbolOf('const'))
  link(Type, 'local', sharedSymbolOf('local'))
  link(Type, 'locon', sharedSymbolOf('locon'))

  // symbols for common punctuation
  link(Type, 'escape', sharedSymbolOf('\\'))
  link(Type, 'begin', sharedSymbolOf('('))
  link(Type, 'end', sharedSymbolOf(')'))
  link(Type, 'comma', sharedSymbolOf(','))
  // period is only special when it's immediately after a ')'.
  link(Type, 'period', sharedSymbolOf('.'))
  link(Type, 'semicolon', sharedSymbolOf(';'))
  link(Type, 'literal', sharedSymbolOf('@'))
  link(Type, 'pairing', sharedSymbolOf(':'))
  link(Type, 'subject', sharedSymbolOf('$'))
  link(Type, 'comment', sharedSymbolOf('#'))

  // create a symbol from a key.
  link(Type, 'of', function (key) {
    return typeof key === 'string'
      ? sharedSymbols[key] || new Symbol$(key)
      : key instanceof Symbol$ ? key : empty
  }, true)

  // create a shared symbol from a key.
  link(Type, 'of-shared', function (key) {
    return typeof key === 'string' ? sharedSymbolOf(key)
      : key instanceof Symbol$ ? sharedSymbolOf(key.key)
        : empty
  }, true)

  // to test if a string is a safe key or a symbol has a safe key.
  link(Type, 'is-safe', function (key, type) {
    return typeof key === 'string'
      ? type === Type ? isSafeSymbol(key) : isSafeName(key)
      : key instanceof Symbol$
        ? type === Type ? isSafeSymbol(key.key) : isSafeName(this.key)
        : false
  }, true)

  var proto = Type.proto
  link(proto, 'key', function () {
    return this.key
  })

  // test if this symbol has a safe key.
  link(proto, 'is-safe', function (type) {
    return type === Type ? isSafeSymbol(this.key) : isSafeName(this.key)
  })
  link(proto, 'is-unsafe', function (type) {
    return type === Type ? !isSafeSymbol(this.key) : !isSafeName(this.key)
  })

  // Identity and Equivalence is determined by the key
  link(proto, ['is', '===', 'equals', '=='], function (another) {
    return this === another || (
      another instanceof Symbol$ && this.key === another.key
    )
  })
  link(proto, ['is-not', '!==', 'not-equals', '!='], function (another) {
    return this !== another && (
      !(another instanceof Symbol$) || this.key !== another.key
    )
  })

  // Ordering: to determine by the string value of key.
  link(proto, 'compares-to', function (another) {
    return this === another ? 0
      : another instanceof Symbol$
        ? strComparesTo.call(this.key, another.key)
        : null
  })

  // Emptiness: The empty symbol's key is an empty string.
  link(proto, 'is-empty', function () {
    return this.key === '' || this.key === '\t'
  })
  link(proto, 'not-empty', function () {
    return this.key !== '' && this.key !== '\t'
  })

  // Representation
  link(proto, 'to-string', function (format) {
    switch (format) {
      case $String:
        // result can be either a literal symbol or string, like field name.
        return isSafeSymbol(this.key) ? this.key : strToString.call(this.key)
      case $Tuple:
        // make sure the result can be recover to a symbol.
        return !this.key ? '(`)'
          : isSafeSymbol(this.key) ? '(`' + this.key + ')'
            : '(symbol of ' + strToString.call(this.key) + ')'
      case Type:
        // result can be either a literal symbol or other literal value.
        return isSafeSymbol(this.key) ? this.key : escapeSymbol(this.key)
      default:
        return this.key
    }
  })

  // Indexer
  var indexer = link(proto, ':', function (index) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/tuple.js":
/*!*****************************!*\
  !*** ./es/generic/tuple.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function tupleIn ($void) {
  var $ = $void.$
  var Type = $.tuple
  var $Array = $.array
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var Range$ = $void.Range
  var Symbol$ = $void.Symbol
  var link = $void.link
  var thisCall = $void.thisCall
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf

  // the empty value
  var empty = link(Type, 'empty', new Tuple$([]))
  // the empty value for a plain tuple.
  var blank = link(Type, 'blank', new Tuple$([], true))
  // an unknown structure.
  var unknown = link(Type, 'unknown', new Tuple$([$Symbol.etc]))

  // empty operations
  link(Type, 'lambda', new Tuple$([$Symbol.lambda, empty, blank]))
  link(Type, 'stambda', new Tuple$([$Symbol.stambda, empty, blank]))
  link(Type, 'function', new Tuple$([$Symbol.function, empty, blank]))
  link(Type, 'operator', new Tuple$([$Symbol.operator, empty, blank]))

  // empty objects
  link(Type, 'array', new Tuple$([$Symbol.literal]))
  link(Type, 'object', new Tuple$([$Symbol.literal, $Symbol.pairing]))
  link(Type, 'class', new Tuple$([
    $Symbol.literal, $Symbol.pairing, sharedSymbolOf('class')
  ]))

  // check if the value can be accepted as an element of a tuple.
  link(Type, 'accepts', function (value) {
    return value instanceof Symbol$ ||
      value instanceof Tuple$ ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Range$ ||
      value instanceof Date ||
      value === null ||
      typeof value === 'undefined'
  }, true)

  var atomOf = link(Type, 'atom-of', function (value) {
    return value instanceof Symbol$ ||
      value instanceof Tuple$ ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Range$ ||
      value instanceof Date ||
      value === null ? value : typeof value === 'undefined' ? null : unknown
  }, true)

  var append = function () {
    var i = this.length
    this.push.apply(this, arguments)
    for (; i < this.length; i++) {
      this[i] = atomOf(this[i])
    }
    return this
  }

  // create a common tuple (statement) of the argument values.
  link(Type, 'of', function () {
    return arguments.length ? new Tuple$(append.apply([], arguments)) : empty
  }, true)

  // create a plain tuple (code block or list of statements) of the argument values
  link(Type, 'of-plain', function () {
    return arguments.length
      ? new Tuple$(append.apply([], arguments), true) : blank
  }, true)

  // create a tuple by elements from the iterable arguments or the argument
  // values itself if it's not iterable.
  link(Type, 'from', function () {
    return merge.apply(empty, arguments)
  }, true)
  link(Type, 'from-plain', function () {
    return merge.apply(blank, arguments)
  }, true)

  var proto = Type.proto
  // the length of this tuple.
  link(proto, 'length', function () {
    return this.$.length
  })

  // the flag of a plain tuple.
  link(proto, 'is-plain', function () {
    return this.plain === true
  })
  link(proto, 'not-plain', function () {
    return this.plain !== true
  })

  // generate a plain tuple.
  link(proto, 'as-plain', function () {
    return this.plain === true ? this
      : this.$.length < 1 ? blank : new Tuple$(this.$, true)
  })

  // the source map of this tuple.
  link(proto, 'source-map', function () {
    return this.source
  })

  var array = $Array.proto
  // generate an iterator function to traverse all items.
  link(proto, 'iterate', function () {
    return array.iterate.apply(this.$, arguments)
  })

  // make a new copy with all items or some in a range of (begin, begin + count).
  link(proto, 'copy', function (begin, count) {
    var s = array.copy.apply(this.$, arguments)
    return s && s.length > 0
      ? s.length === this.$.length ? this : new Tuple$(s, this.plain)
      : this.plain ? blank : empty
  })
  // make a new copy with all items or some in a range of (begin, end).
  link(proto, 'slice', function (begin, end) {
    var s = array.slice.apply(this.$, arguments)
    return s && s.length > 0
      ? s.length === this.$.length ? this : new Tuple$(s, this.plain)
      : this.plain ? blank : empty
  })

  // retrieve the first n element(s).
  link(proto, 'first', function (count) {
    if (typeof count === 'undefined') {
      return array.first.call(this.$)
    }
    var s = array.first.call(this.$, count >> 0)
    return s && s.length > 0
      ? s.length >= this.$.length ? this : new Tuple$(s, this.plain)
      : this.plain ? blank : empty
  })
  // find the first occurrence of a value.
  link(proto, 'first-of', function (value) {
    return array['first-of'].call(this.$, value)
  })
  // retrieve the last n element(s).
  link(proto, 'last', function (count) {
    if (typeof count === 'undefined') {
      return array.last.call(this.$)
    }
    var s = array.last.call(this.$, count >> 0)
    return s && s.length > 0
      ? s.length >= this.$.length ? this : new Tuple$(s, this.plain)
      : this.plain ? blank : empty
  })
  // find the last occurrence of a value.
  link(proto, 'last-of', function (value) {
    return array['last-of'].call(this.$, value)
  })

  // merge the items of this tuple and argument values to create a new one.
  link(proto, 'concat', function () {
    var list = append.apply(this.$.slice(0), arguments)
    return list.length > this.$.length ? new Tuple$(list, this.plain) : this
  })

  // merge this tuple and items from the argument tuples or arrays.
  var merge = link(proto, ['merge', '+'], function () {
    var list = this.$.slice(0)
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i]
      if (Array.isArray(source)) {
        append.apply(list, array.select.call(source)) // compress discrete array.
      } else if (source instanceof Tuple$) {
        list.push.apply(list, source.$)
      } else {
        list.push(atomOf(source))
      }
    }
    return list.length > this.$.length ? new Tuple$(list, this.plain) : this
  })

  // convert to an array, the items will be left as they're.
  link(proto, 'to-array', function () {
    return this.$.slice(0)
  })

  // Equivalence: to be determined by field values.
  var equals = link(proto, ['equals', '=='], function (another) {
    if (this === another) {
      return true
    }
    if (!(another instanceof Tuple$) ||
      this.plain !== another.plain ||
      this.$.length !== another.$.length) {
      return false
    }
    var t$ = this.$
    var a$ = another.$
    for (var i = t$.length - 1; i >= 0; i--) {
      if (!thisCall(t$[i], 'equals', a$[i])) {
        return false
      }
    }
    return true
  })
  link(proto, ['not-equals', '!='], function (another) {
    return !equals.call(this, another)
  })

  // override comparison logic to keep consistent with Equivalence.
  link(proto, 'compares-to', function (another) {
    return equals.call(this, another) ? 0 : null
  })

  // Emptiness: an empty tuple has no items.
  link(proto, 'is-empty', function () {
    return !(this.$.length > 0)
  })
  link(proto, 'not-empty', function () {
    return this.$.length > 0
  })

  // expand to a string list as an enclosed expression or a series of expressions.
  var punctuations = new Set([
    $Symbol.begin,
    $Symbol.end,
    $Symbol.comma,
    $Symbol.semicolon,
    $Symbol.pairing
  ])
  var encode = function (list, indent, padding) {
    if (!Array.isArray(list)) {
      list = []
    }
    if (typeof indent !== 'string') {
      indent = '  '
    }
    if (typeof padding !== 'string') {
      padding = ''
    }
    if (this.plain && this.$.length === 1) { // unwrap a container block
      if (list.length > 0) {
        list.push(' ')
      }
      if (this.$[0] instanceof Tuple$) {
        encode.call(this.$[0], list, indent, padding)
      } else {
        list.push(thisCall(this.$[0], 'to-string'))
      }
      return list
    }

    var i, item
    var lineBreak = '\n' + padding
    if (this.plain) {
      for (i = 0; i < this.$.length; i++) {
        list.push(lineBreak)
        item = this.$[i]
        if (item instanceof Tuple$) {
          encode.call(item, list, indent, padding)
        } else {
          list.push(thisCall(item, 'to-string'))
        }
      }
      return list
    }

    list.push('(')
    var first = true
    var isLiteral = false
    for (i = 0; i < this.$.length; i++) {
      item = this.$[i]
      ;(i === 0) && (isLiteral = item === $Symbol.literal)
      ;(i === 1) && (isLiteral = isLiteral && (item === $Symbol.pairing))
      if (item instanceof Tuple$) {
        if (item.plain) {
          if (item.$.length > 0) {
            encode.call(item, list, indent, padding + indent)
            item.$.length > 1 && list.push(lineBreak)
          }
        } else {
          first ? (first = false) : list.push(' ')
          encode.call(item, list, indent, padding)
        }
      } else {
        if (punctuations.has(item)) {
          list.push(item.key)
        } else if ($void.operatorSymbols.has(item) && i < 1) {
          first = false
          list.push(item.key)
        } else {
          first ? (first = false)
            : isLiteral && i === 2 ? (isLiteral = false) : list.push(' ')
          list.push($void.thisCall(item, 'to-string'))
        }
      }
    }
    list.push(')')
    return list
  }

  // Representation: as an enclosed expression or a plain series of expression.
  link(proto, 'to-string', function (indent, padding) {
    return encode.call(this, [], indent, padding).join('')
  })

  // Indexer
  var indexer = link(proto, ':', function (index, end) {
    return typeof index === 'string' ? protoValueOf(this, proto, index)
      : index instanceof Symbol$ ? protoValueOf(this, proto, index.key)
        : typeof index !== 'number' ? null
          : typeof end === 'undefined' ? this.$[index]
            : new Tuple$(array.slice.apply(this.$, arguments), this.plain)
  })
  indexer.get = function (key) {
    return proto[key]
  }

  // export type indexer.
  link(Type, 'indexer', indexer)
}


/***/ }),

/***/ "./es/generic/type.js":
/*!****************************!*\
  !*** ./es/generic/type.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function typeIn ($void) {
  var $ = $void.$
  var Type = $.type
  var $Symbol = $.symbol
  var $Object = $.object
  var Null = $void.null
  var Symbol$ = $void.Symbol
  var link = $void.link
  var typeOf = $void.typeOf
  var bindThis = $void.bindThis
  var isApplicable = $void.isApplicable
  var protoValueOf = $void.protoValueOf
  var sharedSymbolOf = $void.sharedSymbolOf

  /* The Supreme Prototype */
  var proto = Type.proto

  // Identity inherits null.
  // Equivalence inherits null.
  // Ordering inherits null.

  // Type Verification: Any non-empty value is an instance of its type.
  link(proto, ['is-a', 'is-an'], function (type) {
    return typeOf(this) === type
  })
  link(proto, ['is-not-a', 'is-not-an'], function (type) {
    return typeOf(this) !== type
  })

  // Emptiness needs to be customized by each type.

  // Encoding inherits null.

  // Representation and Description need be customized by each type.

  // Indexer: default read-only accessor for all types.
  // all value types' proto must provide a customized indexer.
  var indexer = link(proto, ':', function (index) {
    var name = typeof index === 'string' ? index
      : index instanceof Symbol$ ? index.key : ''
    return name === 'proto' ? this.reflect()
      : name !== 'indexer' ? protoValueOf(this, this, name)
        : bindThis(isApplicable(this.empty) ? this.empty() : this.empty,
          this.indexer
        )
  })
  indexer.get = function (key) {
    return key === 'proto' ? this.reflect()
      : key === 'indexer' ? null : this[key]
  }

  // the type is its own empty value.
  link(Type, 'empty', Type)

  // Retrieve the real type of an entity.
  link(Type, 'of', typeOf, true)

  // Retrieve the indexer for this type's instances.
  link(Type, 'indexer', indexer)

  // Type Reflection: Convert this type to a type descriptor object.
  link(Type, 'reflect', function (entity) {
    var typeDef = $Object.empty()
    var name
    if (this === Type && entity === null) {
      for (name in Null) {
        typeDef[name] = bindThis(null, Null[name])
      }
      typeDef.type = null
      return typeDef
    }

    var proto_ = this.proto
    var value, thisEmpty
    if (typeOf(entity) === this) {
      thisEmpty = entity
    }
    for (name in proto_) {
      if (name !== 'type' && typeof proto[name] === 'undefined') {
        value = proto_[name]
        typeDef[name] = !isApplicable(value) ? value
          : bindThis(typeof thisEmpty !== 'undefined' ? thisEmpty
            : (thisEmpty = isApplicable(this.empty) ? this.empty() : this.empty)
          , value)
      }
    }
    var typeStatic = typeDef.type = $Object.empty()
    for (name in this) {
      if (name !== 'proto' && name !== 'type' && typeof proto[name] === 'undefined') {
        value = this[name]
        typeStatic[name] = !isApplicable(value) ? value
          : bindThis(name !== 'indexer' ? this
            : typeof thisEmpty !== 'undefined' ? thisEmpty
              : (thisEmpty = isApplicable(this.empty) ? this.empty() : this.empty)
          , value)
      }
    }
    return typeDef
  })

  // Mutability
  link(Type, 'seal', function () {
    return this
  })
  link(Type, 'is-sealed', function () {
    return true // all primary types are sealed.
  })

  // Type Verification: Any type is a type.
  link(Type, ['is-a', 'is-an'], function (type) {
    return Type === type
  }, true)
  link(Type, ['is-not-a', 'is-not-an'], function (type) {
    return Type !== type
  }, true)

  // Emptiness for types:
  //  The primal type is taken as an empty entity.
  //  Any other type is not empty.
  link(Type, 'is-empty', function () {
    return this === Type
  })
  link(Type, 'not-empty', function () {
    return this !== Type
  })

  // Encoding a type by its name
  link(Type, 'to-code', function () {
    return typeof this.name === 'string'
      ? sharedSymbolOf(this.name) : $Symbol.empty
  })

  // Description for all types
  link(Type, 'to-string', function () {
    return typeof this.name === 'string' ? this.name : ''
  })
}


/***/ }),

/***/ "./es/generic/void.js":
/*!****************************!*\
  !*** ./es/generic/void.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function createEmptyOperation () {
  return function () {
    return null
  }
}

module.exports = function voidSetup ($void) {
  var $ = $void.$
  var $Map = $.map
  var $Set = $.set
  var $Tuple = $.tuple
  var $Bool = $.bool
  var $Date = $.date
  var $Number = $.number
  var $String = $.string
  var $Object = $.object
  var $Array = $.array
  var $Lambda = $.lambda
  var $Function = $.function
  var $Operator = $.operator
  var $Promise = $.promise
  var Null = $void.null
  var Type$$ = $void.Type$
  var Tuple$ = $void.Tuple
  var Object$ = $void.Object
  var Symbol$ = $void.Symbol
  var Promise$ = $void.Promise
  var operator = $void.operator
  var ClassType$ = $void.ClassType
  var isApplicable = $void.isApplicable

  // a temporary space to keep app-only global functions.
  $void.$app = Object.create(null)

  // flag indicates if it's running in native host.
  $void.isNativeHost = typeof window === 'undefined'

  // generate an empty function.
  $void.createEmptyOperation = createEmptyOperation

  // a static version of isPrototypeOf.
  var isPrototypeOf = Function.prototype.call.bind(Object.prototype.isPrototypeOf)
  $void.isPrototypeOf = isPrototypeOf

  // a static version of hasOwnProperty.
  var ownsProperty = Function.prototype.call.bind(
    Object.prototype.hasOwnProperty
  )
  $void.ownsProperty = ownsProperty

  // ensure the runtime bind can be safely called
  var safelyBind = Function.prototype.call.bind(
    Function.prototype.bind
  )
  $void.safelyBind = safelyBind

  // support native new operator on a constructor function
  var newInstance = function (T) {
    return new T(...Array.prototype.slice(arguments, 1))
  }
  $void.newInstance = newInstance

  // safe copy all members from a generic object or function source to a target
  // object. To generate "bind", "call" and "new" operations for a function.
  var safelyAssign = function (target, source, ownedOnly) {
    for (var key in source) {
      if (!ownedOnly || ownsProperty(source, key)) {
        var value = source[key]
        target[key] = typeof value !== 'function' ? value
          : safelyBind(value, source)
      }
    }
    if (typeof source === 'function') {
      !target.new && (target.new = newInstance.bind(null, source))
      !target.bind && (target.bind = safelyBind(Function.prototype.bind, source))
      !target.call && (target.call = safelyBind(Function.prototype.call, source))
    }
    return target
  }
  $void.safelyAssign = safelyAssign

  // make sure a file uri has correct espresso extension
  $void.completeFile = function (path, testing) {
    return !path || typeof path !== 'string'
      ? testing ? 'test.es' : 'index.es'
      : path.endsWith('/') ? path + (testing ? 'test.es' : 'index.es')
        : path.endsWith('.es') ? path : path + '.es'
  }

  // to retrieve or create a shared symbol.
  var sharedSymbols = $void.sharedSymbols = Object.create(null)
  function sharedSymbolOf (key) {
    return sharedSymbols[key] || (sharedSymbols[key] = new Symbol$(key))
  }
  $void.sharedSymbolOf = sharedSymbolOf

  // generic operators cannot be overridden in program. They are interpreted
  // directly in core evaluation function.
  function staticOperator (name, impl, entity) {
    // export an alternative entity or make it a pure symbol.
    typeof entity !== 'undefined' ? $export($, name, entity)
      : ($[name] = sharedSymbolOf(name))
    // export the implementation.
    $void.staticOperators[name] = operator(impl, $Tuple.operator)
    return impl
  }
  $void.staticOperator = staticOperator

  $void.regexNumber = /(^)([-+]?\d*\.\d+|[-+]?\d+\.\d*|[+-]\d+|\d+)/
  $void.regexDecimal = /(^)([-+]?\d*\.\d+|[-+]?\d+\.\d*|[+-]\d+|\d\b|[1-9]\d*)/
  $void.regexPunctuation = /[\\(,)\s]/
  $void.regexSpecialSymbol = /[(`@:$"#)',;\\\s[\]{}]/

  $void.regexConstants = /^(null|true|false)$/
  $void.constantValues = Object.assign(Object.create(null), {
    'null': null,
    'true': true,
    'false': false
  })

  var regexNumber = $void.regexNumber
  var regexConstants = $void.regexConstants
  var regexPunctuation = $void.regexPunctuation
  var regexSpecialSymbol = $void.regexSpecialSymbol

  var isSafeName = $void.isSafeName = function (key) {
    return !!key && !regexSpecialSymbol.test(key) &&
      !regexConstants.test(key) &&
        !regexNumber.test(key)
  }
  $void.isSafeSymbol = function (key) {
    return !!key && !regexPunctuation.test(key) &&
      (!regexSpecialSymbol.test(key) || key.length < 2) &&
        !regexConstants.test(key) &&
          !regexNumber.test(key)
  }
  $void.escapeSymbol = function (key) {
    var chars = []
    for (var i = 0; i < key.length; i++) {
      regexSpecialSymbol.test(key[i]) && chars.push('\\')
      chars.push(key[i])
    }
    return chars.join('')
  }
  $void.encodeFieldName = function (name) {
    return isSafeName(name)
      ? (sharedSymbols[name] || new Symbol$(name)) // print as a symbol.
      : name // print as a literal string.
  }

  // to check if an value is a compatible object.
  $void.isObject = function (obj) {
    return obj instanceof Object$ || typeOf(obj) === $Object
  }

  // retrieve the real type of an entity.
  function typeOf (entity) {
    if (entity === null || typeof entity === 'undefined') {
      return null
    }
    switch (typeof entity) {
      case 'boolean':
        return $Bool
      case 'number':
        return $Number
      case 'string':
        return $String
      case 'function':
        return entity.type === $Lambda ? $Lambda
          : entity.type === $Operator ? $Operator
            : $Function
      case 'object':
        // TODO: use symbol to inject type?
        return entity instanceof Type$$
          ? Object.getPrototypeOf(entity).type || $Object
          : Array.isArray(entity) ? $Array
            : entity instanceof Date ? $Date
              : entity instanceof Promise$ ? $Promise
                : entity instanceof Set ? $Set
                  : entity instanceof Map ? $Map
                    : $Object
      default:
        return null
    }
  }
  $void.typeOf = typeOf

  // test a boolean value of any value.
  $void.isTruthy = function (v) {
    return typeof v === 'undefined' || (v !== false && v !== null && v !== 0)
  }

  $void.isFalsy = function (v) {
    return typeof v !== 'undefined' && (v === false || v === null || v === 0)
  }

  // retrieve the system indexer of an entity.
  var indexerOf = $void.indexerOf = function (entity) {
    var type = typeOf(entity)
    return (type && type.indexer) || Null[':']
  }

  // retrieve a field value from prototype; it will be bound to its subject
  // if it's a function.
  var protoValueOf = $void.protoValueOf = function (subject, proto, key) {
    var value = proto[key]
    return typeof value === 'function' && (
      value.type === $Lambda || value.type === $Function
    ) ? bindThis(subject, value) : value
  }

  function thisCall (subject, methodName) {
    var method = indexerOf(subject).call(subject, methodName)
    return typeof method !== 'function' ? method
      : arguments.length < 3 ? method.call(subject)
        : method.apply(subject, Array.prototype.slice.call(arguments, 2))
  }
  $void.thisCall = thisCall

  // try to update the name of a function or a class.
  var tryToUpdateName = $void.tryToUpdateName = function (entity, name) {
    if (typeof entity === 'function') {
      if (!entity.name || typeof entity.name !== 'string') {
        Object.defineProperty(entity, 'name', { value: name })
      }
    } else if (entity instanceof ClassType$) {
      if (!entity.name || typeof entity.name !== 'string') {
        entity.name = name
      }
    }
    return entity
  }

  // to export an entity to a space.
  function $export (space, name, entity) {
    // ensure exported names are shared.
    sharedSymbolOf(name)
    // automatically bind null for static methods
    if (isApplicable(entity)) {
      entity = bindThis(null, entity)
    }
    tryToUpdateName(entity, name)
    if (entity && typeof entity === 'object') {
      entity.seal ? entity.seal() : Object.freeze(entity)
    }
    return (space[name] = entity)
  }
  $void.export = $export

  // create a bound function from the original function or lambda.
  function bindThis ($this, func) {
    if (typeof func.this !== 'undefined') {
      // a this-bound static lambda may not be bound.
      return func
    }
    var binding = safelyBind(func, $this)
    binding.this = $this
    binding.bound = func
    typeof func.code !== 'undefined' && (
      binding.code = func.code
    )
    if (typeof func.name === 'string') {
      Object.defineProperty(binding, 'name', {
        value: func.name
      })
    }
    if (binding.type !== func.type) {
      binding.type = func.type
    }
    if (func.type === $Lambda && func.static === true) {
      binding.const = true // upgrade static to const lambda
    }
    return binding
  }
  $void.bindThis = bindThis

  // to link an entity to its owner.
  function link (owner, names, entity, autoBind) {
    if (typeof entity === 'function') {
      if (!ownsProperty(entity, 'type')) {
        entity.type = $Lambda
      }
      if (!entity.name) {
        Object.defineProperty(entity, 'name', {
          value: typeof names === 'string' ? names : names[0]
        })
      }
      if (autoBind && isApplicable(entity)) {
        entity = bindThis(owner, entity)
      }
    }
    if (typeof names === 'string') {
      sharedSymbolOf(names)
      owner[names] = entity
    } else {
      for (var i = 0; i < names.length; i++) {
        sharedSymbolOf(names[i])
        owner[names[i]] = entity
      }
    }
    return entity
  }
  $void.link = link

  // to export native type (static) methods.
  $void.copyType = function (target, src, mapping) {
    var names = Object.getOwnPropertyNames(mapping)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      var entity = src[name]
      if (typeof entity === 'function') {
        entity = safelyBind(entity, src)
        entity.type = $Lambda
        Object.defineProperty(entity, 'name', {
          value: mapping[name]
        })
      }
      target[mapping[name]] = entity
    }
    return target
  }

  $void.prepareOperation = function (type, noop, emptyCode) {
    // the empty function
    Object.defineProperty(noop, 'name', {
      value: 'noop'
    })
    var empty = link(type, 'empty', function () {
      return noop
    }, true)

    // a placeholder of function
    link(type, 'of', empty, true)

    var proto = type.proto
    // return operation's name
    link(proto, 'name', function () {
      return typeof this.name === 'string' ? this.name : ''
    })

    // return operation's parameters
    link(proto, 'parameters', function () {
      return (this.code || emptyCode).$[1]
    })

    // return operation's body
    link(proto, 'body', function () {
      return (this.code || emptyCode).$[2]
    })

    // test if the operation is a generic one.
    link(proto, 'is-generic', function () {
      return !(this.code instanceof Tuple$)
    })
    link(proto, 'not-generic', function () {
      return this.code instanceof Tuple$
    })

    // Emptiness: a managed operation without a body.
    link(proto, 'is-empty', function () {
      return this.code instanceof Tuple$ &&
          (this.code.$.length < 3 || this.code.$[2].$.length < 1)
    })
    link(proto, 'not-empty', function () {
      return !(this.code instanceof Tuple$) ||
          (this.code.$.length > 2 && this.code.$[2].$.length > 0)
    })

    // Encoding
    link(proto, 'to-code', function (ctx) {
      return this.code || emptyCode
    })

    // Description
    link(proto, 'to-string', function () {
      return (this.code || emptyCode)['to-string']()
    })

    // Indexer
    var indexer = link(proto, ':', function (index) {
      return typeof index === 'string' ? protoValueOf(this, proto, index)
        : index instanceof Symbol$ ? protoValueOf(this, proto, index.key) : null
    })
    indexer.get = function (key) {
      return proto[key]
    }

    // export type indexer.
    link(type, 'indexer', indexer)
  }

  $void.prepareApplicable = function (type, emptyCode) {
    var proto = type.proto

    // test if the lambda/function has been bound to a subject.
    link(proto, 'is-bound', function () {
      return typeof this.bound === 'function'
    })
    link(proto, 'not-bound', function () {
      return typeof this.bound !== 'function'
    })

    // return operation's parameters
    link(proto, 'this', function () {
      return typeof this.bound === 'function' ? this.this : null
    })

    // apply a function and expand arguments from an array.
    link(proto, 'apply', function (subject, args) {
      return typeof subject === 'undefined' ? this.apply(null)
        : Array.isArray(args) ? this.apply(subject, args)
          : typeof args === 'undefined'
            ? this.call(subject)
            : this.call(subject, args)
    })

    link(proto, ['is', '==='], function (another) {
      return typeof another === 'function' && (this === another || (
        typeof this.this !== 'undefined' && (
          this.this === another.this || Object.is(this.this, another.this)
        ) && typeof this.bound !== 'undefined' && this.bound === another.bound
      ))
    })
    link(proto, ['is-not', '!=='], function (another) {
      return typeof another !== 'function' || (this !== another && (
        typeof this.this === 'undefined' || (
          this.this !== another.this && !Object.is(this.this, another.this)
        ) || typeof this.bound === 'undefined' || this.bound !== another.bound
      ))
    })

    link(proto, ['equals', '=='], function (another) {
      return typeof another === 'function' && (
        this === another || this === another.bound || (
          typeof this.bound !== 'undefined' && (
            this.bound === another || this.bound === another.bound
          )
        )
      )
    })
    link(proto, ['not-equals', '!='], function (another) {
      return typeof another !== 'function' || (
        this !== another && this !== another.bound && (
          typeof this.bound === 'undefined' || (
            this.bound !== another && this.bound !== another.bound
          )
        )
      )
    })
  }
}


/***/ }),

/***/ "./es/lib/emitter.js":
/*!***************************!*\
  !*** ./es/lib/emitter.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function emitterIn ($void) {
  var $ = $void.$
  var $Object = $.object
  var link = $void.link
  var $export = $void.export
  var isObject = $void.isObject
  var thisCall = $void.thisCall
  var createClass = $void.createClass
  var isApplicable = $void.isApplicable

  var emitter = createClass()
  var proto = emitter.proto
  link(proto, 'listeners', null)

  // define allowed events for this emitter
  link(proto, 'constructor', function () {
    var listeners = this.listeners = $Object.empty()
    for (var i = 0; i < arguments.length; i++) {
      var event = arguments[i]
      if (typeof event === 'string') {
        listeners[event] = []
      }
    }
  })

  // clear legacy event handler on activation.
  link(proto, 'activator', function () {
    if (!isObject(this.listeners)) {
      this.listeners = $Object.empty()
      return
    }
    var events = Object.getOwnPropertyNames(this.listeners)
    for (var i = 0; i < events.length; i++) {
      var listeners = this.listeners[events[i]]
      if (Array.isArray(listeners)) {
        for (var j = listeners.length - 1; j >= 0; j--) {
          if (thisCall(listeners[j], 'is-empty')) {
            listeners.splice(j, 1) // remove empty listeners
          }
        }
      }
    }
  })

  // (an-emitter on) queries allowed events.
  // (an-emitter on event) queries all listeners for an event
  // (an-emitter on event listener) registers a listener for the event.
  link(proto, 'on', function (event, listener) {
    if (!isObject(this.listeners)) {
      return null // invalid emitter instance.
    }
    // query events
    if (typeof event !== 'string') {
      return Object.getOwnPropertyNames(this.listeners)
    }
    // query listeners for an event.
    if (!isApplicable(listener)) {
      return this.listeners[event] || null
    }
    // register an event listener
    var listeners = this.listeners[event]
    if (!Array.isArray(listeners)) {
      return null // invalid emitter instance
    }
    listeners.push(listener)
    return listeners
  })

  // (an-emitter off) clears all listeners for all events.
  // (an-emitter off event) clears all listeners for the event.
  // (an-emitter on event listener) clears a listener for the event.
  link(proto, 'off', function (event, listener) {
    if (!isObject(this.listeners)) {
      return null
    }
    var i, listeners
    // clear all event listeners.
    if (typeof event !== 'string') {
      var events = Object.getOwnPropertyNames(this.listeners)
      for (i = 0; i < events.length; i++) {
        listeners = this.listeners[events[i]]
        if (Array.isArray(listeners)) {
          listeners.splice(0)
        }
      }
      return events
    }
    // clear listeners for an event.
    listeners = this.listeners[event]
    if (!Array.isArray(listeners)) {
      return null
    }
    if (!isApplicable(listener)) {
      listeners.splice(0)
      return listeners
    }
    // clear a particular listener
    for (i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1)
        break
      }
    }
    return listeners
  })

  link(proto, 'emit', function (event, args) {
    if (!isObject(this.listeners) || typeof event !== 'string') {
      return null // invalid emitter instance.
    }
    var listeners = this.listeners[event]
    if (!Array.isArray(listeners)) {
      return null // partially invalid emitter instance at least.
    }
    if (typeof args === 'undefined') {
      args = event
    }
    var handled = false
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i]
      if (isApplicable(listener)) {
        if (listener(args, this, event) === true) {
          return true // event has been handled at least once.
        }
        handled = true
      }
    }
    return handled // no listener to handle this event.
  })

  $export($, 'emitter', emitter)
}


/***/ }),

/***/ "./es/lib/espress.js":
/*!***************************!*\
  !*** ./es/lib/espress.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function hyphenize (name) {
  var segments = name.split(/[_-\s]+/g)
  var converted = false
  for (var i = 0, count = segments.length; i < count; i++) {
    var segment = escapeCamel(segments[i])
    if (segment !== segments[i]) {
      segments[i] = segment
      converted = true
    }
  }
  return segments.length > 1 || converted ? segments.join('-') : name
}

function escapeCamel (segment) {
  var words = []
  var word = ''
  var lastIsCapital = false
  for (var i = 0, len = segment.length; i < len; i++) {
    var c = segment.charAt(i)
    if (c === c.toLocaleLowerCase()) {
      word += c
      lastIsCapital = false
    } else {
      if (word && !lastIsCapital) {
        words.push(word.toLocaleLowerCase())
        word = ''
      }
      var next = ++i < len ? segment[i] : ''
      if (!next) { // ending
        if (lastIsCapital) {
          words.push((word + c).toLocaleLowerCase())
        } else {
          words.push(c.toLocaleLowerCase())
        }
        word = ''
      } else if (next !== next.toLocaleLowerCase()) {
        // several continuous upper-cased chars, except the last one,
        // are counted in a single word.
        word += c; i--
        lastIsCapital = true
      } else {
        word && words.push(word.toLocaleLowerCase())
        word = c + next
        lastIsCapital = false
      }
    }
  }
  word && words.push(word.toLocaleLowerCase())
  return words.join('-')
}

function setter (key, value) {
  if (!key || typeof key !== 'string') {
    return null
  }
  if (typeof value !== 'undefined') {
    return (this[key] = value)
  }
  delete this[key]
  return null
}

module.exports = function espressIn ($void) {
  var $ = $void.$
  var $Class = $.class
  var $Object = $.object
  var $Function = $.function
  var typeOf = $void.typeOf
  var $export = $void.export
  var ownsProperty = $void.ownsProperty
  var safelyAssign = $void.safelyAssign

  var objectOfGenericFunc = $Function.proto.generic

  $export($void.$app, 'espress', function (src) {
    // espress only returns null, a string or an object.
    if (typeof src === 'string') {
      return hyphenize(src)
    }
    // accepts a generic function so that an expression like:
    //   (espress (func generic))
    // can be simplified to:
    //   (espress func)
    var proxy
    var srcType = typeOf(src)
    if (srcType === $Function) {
      proxy = objectOfGenericFunc.call(src)
      srcType = proxy ? $Object : null
      if (src.bound) {
        src = src.bound
      }
    }
    // ignore common proto members.
    var proto
    if (srcType === $Object) {
      proto = $Object.proto
    } else if (typeOf(srcType) === $Class) {
      proto = $Class.proto.proto
    } else {
      return null
    }
    if (!proxy) { // make sure all methods are bound to the original object
      proxy = safelyAssign($Object.empty(), src, true)
    }
    // copy and supplement setters.
    var target = $Object.empty()
    target['set-'] = setter.bind(src) // common setter
    for (var key in proxy) {
      if (typeof proto[key] === 'undefined' || ownsProperty(src, key)) {
        var newKey = hyphenize(key)
        target[newKey] = proxy[key]
        if (ownsProperty(src, key)) {
          // a dedicated setter is only supplemented for a real field.
          target['set-' + newKey] = setter.bind(src, key)
        }
      }
    }
    return target || src
  })
}


/***/ }),

/***/ "./es/lib/format.js":
/*!**************************!*\
  !*** ./es/lib/format.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function parseOffset (str, length) {
  var value
  try {
    value = parseInt(str)
  } catch (e) {
    return e
  }
  if (value < 0) {
    value += length
    if (value < 0) {
      value = length
    }
  } else if (value >= length) {
    value = length
  }
  return value
}

function formatValue (cache, offset, rawValue, fmt, thisCall) {
  if (offset >= cache.length) {
    return '...'
  }
  var value = cache[offset]
  var map
  if (value) {
    if (typeof fmt !== 'string' || typeof rawValue === 'string') {
      return value[0] !== null ? value[0] : (
        value[0] = typeof rawValue === 'string' ? rawValue
          : thisCall(rawValue, 'to-string')
      )
    }
    map = value[1] || (value[1] = Object.create(null))
    return (map[fmt] || (map[fmt] = thisCall(rawValue, 'to-string', fmt)))
  }
  value = cache[offset] = [null, null]
  if (typeof fmt !== 'string' || typeof rawValue === 'string') {
    return (value[0] = typeof rawValue === 'string' ? rawValue
      : thisCall(rawValue, 'to-string'))
  }
  map = value[1] = Object.create(null)
  return (map[fmt] = thisCall(rawValue, 'to-string', fmt))
}

module.exports = function formatIn ($void) {
  var $ = $void.$
  var warn = $void.$warn
  var link = $void.link
  var thisCall = $void.thisCall

  link($.string, 'unescape', function (source) {
    if (typeof source !== 'string') {
      warn('string:unescape', 'a string source should be a string.',
        '\n', source)
      return null
    }
    if (!source.startsWith('"')) {
      warn('string:unescape', 'a string source should start with a \'"\'.',
        '\n', source)
      return source
    }
    if (!source.endsWith('"')) {
      warn('string:unescape', 'a string source should end with a \'"\'.',
        '\n', source)
      return source
    }
    var value, error
    try {
      // TODO: to be replaced a to native unescape processor.
      value = JSON.parse(source)
    } catch (err) {
      error = err
    }
    if (typeof value === 'string') {
      return value
    }
    warn('string:unescape', '[JSON] invalid string input: ',
      (error && error.message) || 'unknown error.', '\n', source)
    return source.substring(1, source.length - 1)
  }, true)

  link($.string, 'format', function (pattern) {
    if (typeof pattern !== 'string') {
      warn('string:format', 'the pattern must be a string.', pattern)
      return null
    }
    var args = []
    if (arguments.length > 1) {
      args[arguments.length - 2] = undefined
    }
    var values = []
    var i = 0
    var counter = 0
    var c, end, placeholder, offset, fmt
    while (i < pattern.length) {
      c = pattern[i++]
      if (c !== '{') {
        values.push(c); continue
      }
      if (pattern[i] === '{') {
        values.push('{'); i++; continue
      }
      end = pattern.indexOf('}', i)
      if (end < i) {
        end = pattern.length
        warn('string:format', 'missing an ending "}".', pattern, i)
      }
      placeholder = pattern.substring(i, end)
      i = end + 1
      end = placeholder.indexOf(':')
      if (end < 0) {
        end = placeholder.length
      }
      offset = placeholder.substring(0, end)
      if (offset) {
        offset = parseOffset(offset, args.length)
      } else if (counter >= args.length) {
        // replace missing implicit placeholder to empty.
        counter++; continue
      } else {
        offset = counter
      }
      if (typeof offset !== 'number') {
        warn('string:format', 'invalid offset value gets ignored',
          pattern, i, placeholder.substring(0, end))
        offset = counter
      } else if (offset >= args.length) {
        warn('string:format', 'offset value is out of range',
          pattern, offset, args.length - 1)
      }
      fmt = end < placeholder.length ? placeholder.substring(end + 1) : null
      values.push(formatValue(args, offset, arguments[offset + 1], fmt, thisCall))
      counter++
    }
    return values.join('')
  }, true)

  $void.formatPattern = function (pattern) {
    if (pattern.indexOf('$') < 0) {
      return [pattern]
    }
    var expr = ''
    var format = []
    var escaping = ''
    var depth = 0
    var args = []
    var pushExpr = function (ending) {
      format.push('{' + args.length + '}')
      args.push(ending ? expr + ending : expr)
      expr = ''; escaping = ''; depth = 0
    }
    var endExpr = function (ending) {
      switch (escaping) {
        case '$':
          if (expr.length > 0) {
            pushExpr()
          } else {
            format.push('$'); escaping = ''
          }
          break
        case ' ':
          pushExpr()
          break
        case '(':
          pushExpr(ending)
          ending !== ')' && warn(
            'format:pattern', 'missing ending parenthesis.', expr
          )
          break
        default:
          break
      }
    }
    for (var i = 0; i < pattern.length; i++) {
      var c = pattern[i]
      switch (escaping) {
        case '$':
          switch (c) {
            case '$':
              format.push('$'); escaping = ''
              break
            case '(':
              if (expr.length > 0) {
                endExpr(); format.push('(')
              } else {
                expr += '('; escaping = '('; depth = 1
              }
              break
            default:
              if (/\)|\s/.test(c)) {
                endExpr(); format.push(c)
              } else {
                expr += c; escaping = ' '
              }
              break
          }
          break
        case ' ':
          if (c === '$') {
            endExpr(); escaping = '$'
          } else if (/\(|\)|\s/.test(c)) {
            endExpr(); format.push(c)
          } else {
            expr += c
          }
          break
        case '(':
          if (c === ')') {
            if (--depth > 0) {
              expr += c
            } else {
              endExpr(')')
            }
          } else {
            if (c === '(') {
              depth += 1
            }
            expr += c
          }
          break
        default:
          c === '$' ? escaping = '$' : format.push(c)
          break
      }
    }
    endExpr()
    return [format.join('')].concat(args)
  }
}


/***/ }),

/***/ "./es/lib/json.js":
/*!************************!*\
  !*** ./es/lib/json.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function jsonIn ($void) {
  var $ = $void.$
  var $Object = $.object
  var link = $void.link
  var $export = $void.export

  var json = $Object.empty()
  link(json, 'of', function (value, defaultJson) {
    try {
      return typeof value === 'undefined' ? 'null'
        : JSON.stringify(value, null, '  ')
    } catch (err) {
      return typeof defaultJson === 'undefined' ? null : defaultJson
    }
  })

  link(json, 'parse', function (json, defaultValue) {
    if (typeof defaultValue === 'undefined') {
      defaultValue = null
    }
    try {
      return typeof json === 'string' ? JSON.parse(json) : defaultValue
    } catch (err) {
      return defaultValue
    }
  })

  $export($, 'json', json)
}


/***/ }),

/***/ "./es/lib/math.js":
/*!************************!*\
  !*** ./es/lib/math.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function mathIn ($void) {
  var $ = $void.$
  var $export = $void.export
  var thisCall = $void.thisCall
  var copyType = $void.copyType

  var math = copyType($.object.empty(), Math, {
    'E': 'e',
    'PI': 'pi',
    'LN2': 'ln-2',
    'LN10': 'ln-10',
    'LOG10E': 'log-e',
    'LOG2E': 'log2-e',
    'SQRT2': 'sqrt-2',
    'SQRT1_2': 'sqrt-1/2',

    'sin': 'sin',
    'cos': 'cos',
    'tan': 'tan',
    'asin': 'asin',
    'acos': 'acos',
    'atan': 'atan',
    'atan2': 'atan2',

    'exp': 'exp',
    'pow': 'pow',
    'log': 'ln',
    'log10': 'log',
    'log2': 'log2',
    'sqrt': 'sqrt',

    'abs': 'abs',
    'max': 'max',
    'min': 'min',

    'random': 'random'
  })

  $export($, 'math', math)

  $export($, 'max', function (x, y) {
    switch (arguments.length) {
      case 0:
        return null
      case 1:
        return x
      case 2:
        return x === null || typeof x === 'undefined' ? y
          : thisCall(x, 'compares-to', y) === -1 ? y : x
      default:
        break
    }
    for (var i = 1; i < arguments.length; i++) {
      y = arguments[i]
      if (y !== null && typeof y !== 'undefined') {
        if (x === null || typeof x === 'undefined' ||
          thisCall(y, 'compares-to', x) === 1) {
          x = y
        }
      }
    }
    return x
  })

  $export($, 'min', function (x, y) {
    switch (arguments.length) {
      case 0:
        return null
      case 1:
        return x
      case 2:
        return x === null || typeof x === 'undefined' ? y
          : thisCall(x, 'compares-to', y) === 1 ? y : x
      default:
        break
    }
    for (var i = 1; i < arguments.length; i++) {
      y = arguments[i]
      if (y !== null && typeof y !== 'undefined') {
        if (x === null || typeof x === 'undefined' ||
          thisCall(y, 'compares-to', x) === -1) {
          x = y
        }
      }
    }
    return x
  })
}


/***/ }),

/***/ "./es/lib/stdout.js":
/*!**************************!*\
  !*** ./es/lib/stdout.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function ($void, stdout) {
  var Symbol$ = $void.Symbol
  var $export = $void.export
  var thisCall = $void.thisCall
  var staticOperator = $void.staticOperator

  // late binding: transient wrappers
  var $env = function (name) {
    $env = $void.$env
    return $env(name)
  }
  var evaluate = function (clause, space) {
    evaluate = $void.evaluate
    return evaluate(clause, space)
  }
  var sourceOf = function (atomValue) {
    return thisCall(atomValue, 'to-string')
  }

  // standard output.
  $void.$print = $export($void.$app, 'print', function (value) {
    return stdout.print.apply(stdout, arguments)
  })

  // standard output.
  $void.$printf = $export($void.$app, 'printf', function (value, format) {
    return stdout.printf(
      typeof value === 'undefined' ? '' : value,
      typeof format === 'undefined' ? null : format
    )
  })

  // standard error, but only warning exists in espresso space.
  var lastWarning = null // save to make it testable.
  function generateWarningId () {
    var ts = Date.now()
    return !lastWarning || ts !== lastWarning[1][0] ? [ts, 0]
      : [ts, lastWarning[1][1] + 1]
  }

  $void.$warn = $export($void.$app, 'warn', function (category) {
    if (typeof category === 'undefined') {
      return lastWarning
    }

    if (typeof category !== 'string' && category !== null) {
      lastWarning = ['stdout:warn', generateWarningId(),
        'category should be a string:', category
      ]
    } else if (category) { // clear warning
      lastWarning = [category, generateWarningId()]
        .concat(Array.prototype.slice.call(arguments, 1))
    } else {
      return (lastWarning = ['', generateWarningId()])
    }
    stdout.warn.apply(stdout, lastWarning)
    return lastWarning
  })

  $export($void, '$debug', function () {
    if ($env('is-debugging') !== true) {
      return false
    }
    stdout.debug.apply(stdout, arguments)
    return true
  })

  staticOperator('debug', function (space, clause) {
    var clist = clause.$
    if (clist.length < 2 || !space.app) {
      return null
    }
    var args = [sourceOf(clause), '\n ']
    for (var i = 1, len = clist.length; i < len; i++) {
      (i > 1) && args.push('\n ')
      args.push(sourceOf(clist[i]), '=', evaluate(clist[i], space))
    }
    if ($env('is-debugging') === true) {
      stdout.debug.apply(stdout, args)
    } else if ($env('logging-level') >= 2) {
      lastWarning = ['stdout:debug',
        '(debug ...) is only for temporary usage in coding.',
        'Please consider to remove it or replace it with (log d ...) for',
        clause
      ]
      stdout.warn.apply(stdout, lastWarning)
    }
    return args[args.length - 1]
  })

  staticOperator('log', function (space, clause) {
    var clist = clause.$
    if (clist.length < 2 || !space.app) {
      return false
    }
    var log = normalizeLevel(clist[1])
    if (log === null) {
      return false
    } else if (!log) {
      lastWarning = ['stdout:log', 'invalid log level (v/i/w/e/d):',
        clist[1], 'in clause', clause
      ]
      stdout.warn.apply(stdout, lastWarning)
      return false
    }

    var args = []
    for (var i = 2, len = clist.length; i < len; i++) {
      args.push(evaluate(clist[i], space))
    }
    log.apply(stdout, args)
    return true
  })

  function normalizeLevel (type) {
    if (type instanceof Symbol$) {
      type = type.key
    } else if (typeof type !== 'string') {
      return false
    }

    switch (type.toLowerCase()) {
      case 'd':
      case 'debug':
        return $env('is-debugging') === true ? stdout.debug : null
      case 'v':
      case 'verbose':
        return $env('logging-level') >= 4 ? stdout.verbose : null
      case 'i':
      case 'info':
        return $env('logging-level') >= 3 ? stdout.info : null
      case 'w':
      case 'warn':
      case 'warning':
        return $env('logging-level') >= 2 ? stdout.warn : null
      case 'e':
      case 'err':
      case 'error':
        return $env('logging-level') >= 1 ? stdout.error : null
      default:
        return false
    }
  }
}


/***/ }),

/***/ "./es/lib/timer.js":
/*!*************************!*\
  !*** ./es/lib/timer.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Started = 'started'
var Elapsed = 'elapsed'
var Stopped = 'stopped'
var DefaultInterval = 1000

function safeDelayOf (milliseconds, defaultValue) {
  return typeof milliseconds !== 'number' ? (defaultValue || 0)
    : (milliseconds >>= 0) <= 0 ? (defaultValue || 0)
      : milliseconds
}

module.exports = function timerIn ($void) {
  var $ = $void.$
  var $Emitter = $.emitter
  var promiseOf = $.promise.of
  var link = $void.link
  var $export = $void.export
  var createClass = $void.createClass
  var isApplicable = $void.isApplicable
  var ownsProperty = $void.ownsProperty

  // a timer is an emitter.
  var timer = createClass().as($Emitter)

  link(timer, 'timeout', function (milliseconds, callback) {
    if (isApplicable(milliseconds)) {
      callback = milliseconds
      milliseconds = 0
    } else {
      milliseconds = safeDelayOf(milliseconds)
      if (!isApplicable(callback)) {
        return milliseconds
      }
    }
    // a simple non-cancellable timeout.
    setTimeout(callback.bind(null, milliseconds), milliseconds)
    return milliseconds
  })

  link(timer, 'countdown', function (milliseconds) {
    milliseconds = safeDelayOf(milliseconds)
    // a cancellable promise-based timeout.
    return promiseOf(function (async) {
      var id = setTimeout(function () {
        if (id !== null) {
          id = null
          async.resolve(milliseconds)
        }
      }, milliseconds)
      return function cancel () {
        if (id !== null) {
          clearTimeout(id)
          id = null
          async.reject(milliseconds)
        }
        return milliseconds
      }
    })
  })

  var proto = timer.proto
  link(proto, 'constructor', function (interval, listener) {
    // call super constructor
    $Emitter.proto.constructor.call(this, Started, Elapsed, Stopped)
    // apply local constructor logic
    this.interval = safeDelayOf(interval, DefaultInterval)
    if (isApplicable(listener)) {
      this.on(Elapsed, listener)
    }
  })

  link(proto, 'activator', function () {
    // call super activator
    $Emitter.proto.activator.apply(this, arguments)

    // apply local activator logic
    this.interval = safeDelayOf(this.interval, DefaultInterval)

    // trying to fix corrupted fields
    var listeners = this.listeners
    var fix = function (event) {
      if (!Array.isArray(listeners[event])) {
        listeners[event] = []
      }
    }
    fix(Started); fix(Elapsed); fix(Stopped)
    if (ownsProperty.call(this, 'stop')) {
      delete this.stop
    }
  })

  link(proto, 'start', function (args) {
    if (this.stop !== stop) {
      return this // the timer is active already.
    }
    if (typeof args === 'undefined') {
      args = this.interval
    }
    // create inner timer.
    var id = setInterval(function () {
      this.emit(Elapsed, args)
    }.bind(this), this.interval)
    // construct the stop function to wrap the native timer.
    this.stop = function () {
      if (id !== null) {
        clearInterval(id)
        id = null
        this.emit(Stopped, args)
      }
    }.bind(this)
    // raise the started event after stop function is ready.
    this.emit(Started, args)
    return this
  })

  link(proto, 'is-elapsing', function () {
    return this.stop !== stop
  })

  var stop = link(proto, 'stop', function () {
    // make this method overridable by an instance method.
    if (this.stop !== stop && isApplicable(this.stop)) {
      this.stop()
      delete this.stop
    }
    return this
  })

  $export($void.$app, 'timer', timer)
}


/***/ }),

/***/ "./es/lib/uri.js":
/*!***********************!*\
  !*** ./es/lib/uri.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function uriIn ($void) {
  var $ = $void.$
  var $Object = $.object
  var link = $void.link
  var $export = $void.export

  var uri = $Object.empty()
  link(uri, 'encode', function (str) {
    return typeof str !== 'string' ? null : encodeURI(str)
  })

  link(uri, 'decode', function (str, defaultValue) {
    if (typeof str !== 'string') {
      return typeof defaultValue === 'undefined' ? null : defaultValue
    }
    if (typeof defaultValue === 'undefined') {
      return decodeURI(str)
    }
    try {
      return decodeURI(str)
    } catch (err) {
      return defaultValue
    }
  })

  link(uri, 'escape', function (str) {
    return typeof str !== 'string' ? null : encodeURIComponent(str)
  })

  link(uri, 'unescape', function (str, defaultValue) {
    if (typeof str !== 'string') {
      return typeof defaultValue === 'undefined' ? null : defaultValue
    }
    if (typeof defaultValue === 'undefined') {
      return decodeURIComponent(str)
    }
    try {
      return decodeURIComponent(str)
    } catch (err) {
      return defaultValue
    }
  })

  $export($, 'uri', uri)
}


/***/ }),

/***/ "./es/operators/arithmetic.js":
/*!************************************!*\
  !*** ./es/operators/arithmetic.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function arithmetic ($void) {
  var $ = $void.$
  var $Number = $.number
  var link = $void.link
  var Space$ = $void.Space
  var Symbol$ = $void.Symbol
  var operator = $void.operator
  var evaluate = $void.evaluate
  var staticOperator = $void.staticOperator

  var mod = $Number.proto['%']
  var symbolSubject = $.symbol.subject

  staticOperator('-', function (space, clause) {
    var value = evaluate(clause.$[1], space)
    return typeof value === 'number' ? (-value) : -0
  }, function (value) {
    return typeof value === 'number' ? (-value) : -0
  })

  staticOperator('++', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 2) {
      return 1
    }
    var sym = clist[1]
    if (sym instanceof Symbol$) { // (++ symbol)
      var value = space.resolve(sym.key)
      return space.let(sym.key, typeof value === 'number' ? value + 1 : 1)
    }
    // as a normal plus-one operation
    sym = evaluate(sym, space)
    return typeof sym === 'number' ? sym + 1 : 1
  }, function (value) {
    return typeof value === 'number' ? (value + 1) : 1
  })

  staticOperator('--', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 2) {
      return -1
    }
    var sym = clist[1]
    if (sym instanceof Symbol$) { // (-- symbol)
      var value = space.resolve(sym.key)
      return space.let(sym.key, typeof value === 'number' ? value - 1 : -1)
    }
    // as a normal minus-one operation
    sym = evaluate(sym, space)
    return typeof sym === 'number' ? sym - 1 : -1
  }, function (value) {
    return typeof value === 'number' ? (value - 1) : -1
  })

  // increment a value by one and assign it back to the same variable
  link($Number.proto, '++', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 1 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var sym = clist[clist[0] === symbolSubject ? 1 : 0]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that + 1)
    }
    return that
  }))

  // increment a value by one and assign it back to the same variable
  link($Number.proto, '--', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return -1 // The value of this operator is defined as 0.
    }
    var clist = clause.$
    var sym = clist[clist[0] === symbolSubject ? 1 : 0]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that - 1)
    }
    return that
  }))

  // (num += num ... )
  link($Number.proto, '+=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      if (typeof value === 'number') {
        that += value
      }
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // (num -= num ... )
  link($Number.proto, '-=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      if (typeof value === 'number') {
        that -= value
      }
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // (num *= num ... )
  link($Number.proto, '*=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      if (typeof value === 'number') {
        that *= value
      }
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // (num /= num ...)
  link($Number.proto, '/=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      if (typeof value === 'number') {
        that /= value
      }
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // (num %= num ...)
  link($Number.proto, '%=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    if (clist.length > base) {
      that = mod.call(that, evaluate(clist[base], space))
      var sym = clist[base - 2]
      if (sym instanceof Symbol$) {
        space.let(sym.key, that)
      }
    }
    return that
  }))
}


/***/ }),

/***/ "./es/operators/assignment.js":
/*!************************************!*\
  !*** ./es/operators/assignment.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function assignment ($void) {
  var $ = $void.$
  var $Symbol = $.symbol
  var symbolAll = $Symbol.all
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var isObject = $void.isObject
  var evaluate = $void.evaluate
  var staticOperator = $void.staticOperator
  var tryToUpdateName = $void.tryToUpdateName

  // 'export' update the variable in most recent context.
  // in function: (export var-name value)), or
  //              (export * object), or
  //              (export (field-name ...) object), or
  //              (export (var-name ...) values)
  // in operator: (export name-expr value-expr)
  staticOperator('export', createOperatorFor('export'))

  // 'var' explicitly declares a local variable in current function's context.
  // in function: (var var-name value)), or
  //              (var * object), or
  //              (var (field-name ...) object), or
  //              (var (var-name ...) values)
  // in operator: (var name-expr value-expr)
  staticOperator('var', createOperatorFor('var'))

  // the once-assignment variable.
  staticOperator('const', createOperatorFor('const'))

  // 'let' update the variable in most recent context.
  // in function: (let var-name value)), or
  //              (let * object), or
  //              (let (field-name ...) object), or
  //              (let (var-name ...) values)
  // in operator: (let name-expr value-expr)
  staticOperator('let', createOperatorFor('let'))

  // 'local' explicitly declares a context variable in and only in current function's context.
  // in function: (local var-name value)), or
  //              (local * object), or
  //              (local (field-name ...) object), or
  //              (local (var-name ...) values)
  // in operator: (local name-expr value-expr)
  staticOperator('local', createOperatorFor('lvar'))

  // the local version of once-assignment variable.
  staticOperator('locon', createOperatorFor('lconst'))

  function createOperatorFor (method) {
    return function (space, clause) {
      var clist = clause.$
      var length = clist.length
      if (length < 2) {
        return null
      }
      var sym = clist[1]
      var values = length < 3 ? null : evaluate(clist[2], space)
      if (space.inop && clause.inop) { // in operator context, let & var works like a function
        sym = evaluate(sym, space)
        var key = typeof sym === 'string' ? sym
          : sym instanceof Symbol$ ? sym.key : null
        return !key ? null
          : space[method](key, tryToUpdateName(values, key))
      }
      var i, names, name, value
      // (var symbol value)
      if (sym instanceof Symbol$) {
        if (sym !== symbolAll) {
          return space[method](sym.key, tryToUpdateName(values, sym.key))
        }
        // (var * obj)
        if (isObject(values)) {
          names = Object.getOwnPropertyNames(values)
          for (i = 0; i < names.length; i++) {
            name = names[i]
            value = values[name]
            space[method](name, space[method](name,
              typeof value === 'undefined' ? null : value
            ))
          }
          return values
        }
        return null
      }
      if (!(sym instanceof Tuple$) || sym.$.length < 1) {
        return null // unrecognized pattern
      }
      // (var (symbol ...) value-or-values).
      var symbols = sym.$
      if (Array.isArray(values)) { // assign the value one by one.
        for (i = 0; i < symbols.length; i++) {
          if (symbols[i] instanceof Symbol$) {
            space[method](symbols[i].key, i < values.length ? values[i] : null)
          }
        }
      } else if (isObject(values)) { // read fields into an array.
        for (i = 0; i < symbols.length; i++) {
          if (symbols[i] instanceof Symbol$) {
            name = symbols[i].key
            value = values[name]
            space[method](name, typeof value === 'undefined' ? null : value)
          }
        }
      } else { // assign all symbols the same value.
        for (i = 0; i < symbols.length; i++) {
          if (symbols[i] instanceof Symbol$) {
            space[method](symbols[i].key, values)
          }
        }
      }
      return values
    }
  }
}


/***/ }),

/***/ "./es/operators/bitwise.js":
/*!*********************************!*\
  !*** ./es/operators/bitwise.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bitwise ($void) {
  var $ = $void.$
  var $Number = $.number
  var link = $void.link
  var Space$ = $void.Space
  var Symbol$ = $void.Symbol
  var evaluate = $void.evaluate
  var operator = $void.operator
  var intValueOf = $void.intValueOf
  var numberValueOf = $void.numberValueOf
  var staticOperator = $void.staticOperator

  var symbolSubject = $.symbol.subject

  staticOperator('~', function (space, clause) {
    if (clause.$.length > 1) {
      var value = evaluate(clause.$[1], space)
      return typeof value === 'number' ? ~value : -1
    }
    return -1
  }, function (value) {
    return typeof value === 'number' ? ~value : -1
  })

  // bitwise AND and assign it back to the same variable
  link($Number.proto, '&=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }
    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var value = clist.length > base ? evaluate(clist[base], space) : 0
    that &= typeof value === 'number' ? value : numberValueOf(value)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // bitwise OR and assign it back to the same variable
  link($Number.proto, '|=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var value = clist.length > base ? evaluate(clist[base], space) : 0
    that |= typeof value === 'number' ? value : numberValueOf(value)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // bitwise XOR and assign it back to the same variable
  link($Number.proto, '^=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var value = clist.length > base ? evaluate(clist[base], space) : 0
    that ^= typeof value === 'number' ? value : numberValueOf(value)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // bitwise left-shift and assign it back to the same variable
  link($Number.proto, '<<=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var offset = clist.length > base ? evaluate(clist[base], space) : 0
    that <<= typeof offset === 'number' ? offset : intValueOf(offset)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // bitwise right-shift and assign it back to the same variable
  link($Number.proto, '>>=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var offset = clist.length > base ? evaluate(clist[base], space) : 0
    that >>= typeof offset === 'number' ? offset : intValueOf(offset)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // bitwise zero-fill right-shift and assign it back to the same variable
  link($Number.proto, '>>>=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'number') {
      return 0 // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    var offset = clist.length > base ? evaluate(clist[base], space) : 0
    that >>>= typeof offset === 'number' ? offset : intValueOf(offset)

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))
}


/***/ }),

/***/ "./es/operators/control.js":
/*!*********************************!*\
  !*** ./es/operators/control.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function control ($void) {
  var $ = $void.$
  var Tuple$ = $void.Tuple
  var Signal$ = $void.Signal
  var Symbol$ = $void.Symbol
  var evaluate = $void.evaluate
  var signalOf = $void.signalOf
  var iterateOf = $void.iterateOf
  var iteratorOf = $.iterator.of
  var sharedSymbolOf = $void.sharedSymbolOf
  var staticOperator = $void.staticOperator

  var symbolElse = sharedSymbolOf('else')
  var symbolIn = sharedSymbolOf('in')
  var symbolUnderscore = sharedSymbolOf('_')

  // (if cond true-branch else false-branch)
  staticOperator('if', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 3) {
      return null // short circuit - the result will be null anyway.
    }

    var result, i, expr
    var cond = evaluate(clist[1], space)
    if (typeof cond !== 'undefined' && cond !== null && cond !== 0 && cond !== false) { //
      expr = clist[2]
      if (expr === symbolElse) {
        return null // no true branch.
      }
      // otherwise this expr is always taken as part of the true branch.
      result = evaluate(expr, space)
      for (i = 3; i < length; i++) {
        expr = clist[i]
        if (expr === symbolElse) {
          return result
        }
        result = evaluate(expr, space)
      }
      return result
    }
    // else, cond is false
    // skip true branch
    for (i = 2; i < length; i++) {
      if (clist[i] === symbolElse) {
        break
      }
    }
    if (i >= length) { // no else
      return null // no false branch
    }
    result = null // in case of the else is the ending expression.
    for (i += 1; i < length; i++) {
      result = evaluate(clist[i], space)
    }
    return result
  })

  // break current loop and use the argument(s) as result
  staticOperator('break', signalOf('break'))
  // skip the rest expressions in this round of loop.
  staticOperator('continue', signalOf('continue'))

  function loopTest (space, cond) {
    if (cond instanceof Symbol$) {
      return space.resolve.bind(space, cond.key)
    }
    if (cond instanceof Tuple$) {
      return evaluate.bind(null, cond, space)
    }
    return cond === false || cond === null || cond === 0
  }

  // condition-based loop
  // (while cond ... )
  staticOperator('while', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 2) {
      return null // no condition
    }

    var test = loopTest(space, clist[1])
    var staticCond = typeof test !== 'function'
    var result = null
    while (true) {
      try {
        if (staticCond) {
          if (test) { return null }
        } else { // break/continue can be used in condition expression.
          var cond = test()
          if (cond === false || typeof cond === 'undefined' || cond === null || cond === 0) {
            break
          }
        }
        for (var i = 2; i < length; i++) {
          result = evaluate(clist[i], space)
        }
      } catch (signal) {
        if (signal instanceof Signal$) {
          if (signal.id === 'continue') {
            result = signal.value
            continue
          }
          if (signal.id === 'break') {
            result = signal.value
            break
          }
        }
        throw signal
      }
    }
    return result
  })

  // a shortcut operator of (iterator of ...)
  staticOperator('in', function (space, clause) {
    var clist = clause.$
    return iteratorOf(clist.length > 1 ? evaluate(clist[1], space) : null)
  })

  // iterator-based loop
  // (for iterable body) - in this case, a variable name '_' is used.
  // (for i in iterable body)
  // (for (i, j, ...) in iterable body)
  staticOperator('for', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 3) {
      return null // short circuit - no loop body
    }
    var test = clist[2]
    return test === symbolIn
      ? length < 5 ? null // short circuit - no loop body
        : forEach(space, clause, clist[1], evaluate(clist[3], space), 4)
      : forEach(space, clause, symbolUnderscore, evaluate(clist[1], space), 2)
  })

  // (for value in iterable body) OR
  // (for (value) in iterable body) OR
  // (for (value1, value2, ...) in iterable body) OR
  // (for (value index) in an-array body) OR
  // (for (key value) in a-map-or-object body)
  function forEach (space, clause, fields, next, offset) {
    var clist = clause.$
    var length = clist.length
    // find out vars
    var vars
    if (fields instanceof Symbol$) {
      vars = [fields.key]
    } else if (fields instanceof Tuple$) {
      vars = []
      var flist = fields.$
      for (var v = 0; v < flist.length; v++) {
        var field = flist[v]
        if (field instanceof Symbol$) {
          vars.push(field.key)
        }
      }
    } else {
      vars = [] // the value is not being caught.
    }
    // evaluate the iterator
    next = iterateOf(next)
    if (!next) {
      return null // no iterator.
    }
    // start to loop
    var result = null
    var values = next()
    while (typeof values !== 'undefined' && values !== null) {
      if (!Array.isArray(values)) {
        values = [values]
      }
      for (var i = 0; i < vars.length; i++) {
        space.var(vars[i], i < values.length ? values[i] : null)
      }
      try {
        for (var j = offset; j < length; j++) {
          result = evaluate(clist[j], space)
        }
      } catch (signal) {
        if (signal instanceof Signal$) {
          if (signal.id === 'continue') {
            result = signal.value
            values = next()
            continue
          }
          if (signal.id === 'break') {
            result = signal.value
            break
          }
        }
        throw signal
      }
      values = next()
    }
    return result
  }
}


/***/ }),

/***/ "./es/operators/fetch.js":
/*!*******************************!*\
  !*** ./es/operators/fetch.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function load ($void) {
  var $ = $void.$
  var $Promise = $.promise
  var run = $void.$run
  var warn = $void.$warn
  var Tuple$ = $void.Tuple
  var Promise$ = $void.Promise
  var evaluate = $void.evaluate
  var completeFile = $void.completeFile
  var sharedSymbolOf = $void.sharedSymbolOf
  var staticOperator = $void.staticOperator

  var promiseAll = $Promise.all
  var symbolFetch = sharedSymbolOf('fetch')
  var promiseOfResolved = $Promise['of-resolved']
  var promiseOfRejected = $Promise['of-rejected']

  // fetch: asynchronously load a module.
  var operator = staticOperator('fetch', function (space, clause) {
    if (!space.app) {
      warn('load', 'invalid without an app context.')
      return null
    }
    var clist = clause.$
    if (clist.length < 2) {
      return null // at least one file.
    }
    if (!space.app) {
      warn('fetch', 'invalid without an app context.')
      return null
    }

    var fetching = fetch.bind(null, $void.loader, space.local['-module-dir'])
    var tasks = []
    for (var i = 1, len = clist.length; i < len; i++) {
      tasks.push(fetching(evaluate(clist[i], space)))
    }
    return promiseAll(tasks)
  })

  function fetch (loader, baseDir, target) {
    if (!target || typeof target !== 'string') {
      warn('fetch', 'invalid module url.', target)
      return promiseOfRejected(target)
    }
    target = completeFile(target)
    if (!target.endsWith('.es')) {
      warn('fetch', 'only supports Espresso modules.', target)
      return promiseOfRejected(target)
    }
    if (!loader.isRemote(target)) {
      target = [baseDir, target].join('/')
    }
    if (!loader.isRemote(target)) {
      warn('fetch', 'only supports remote modules.', target)
      return promiseOfResolved(target)
    }
    return target.endsWith('/@.es')
      ? new Promise$(function (resolve, reject) {
        loader.fetch(target).then(function () {
          var result = run(target)
          if (result instanceof Promise$) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        }, reject)
      })
      : loader.fetch(target)
  }

  $void.bindOperatorFetch = function (space) {
    return (space.$fetch = function (uris) {
      var clist = Array.isArray(uris) ? uris.slice()
        : Array.prototype.slice.call(arguments)
      clist.unshift(symbolFetch)
      for (var i = 1, len = clist.length; i < len; i++) {
        var uri = clist[i]
        if (!uri || typeof uri !== 'string') {
          warn('$fetch', 'invalid target uri:', uri)
          clist[i] = null
        }
      }
      return operator(space, new Tuple$(clist))
    })
  }
}


/***/ }),

/***/ "./es/operators/function.js":
/*!**********************************!*\
  !*** ./es/operators/function.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function function_ ($void) {
  var $ = $void.$
  var $Tuple = $.tuple
  var $Symbol = $.symbol
  var $Lambda = $.lambda
  var $Function = $.function
  var Tuple$ = $void.Tuple
  var evaluate = $void.evaluate
  var signalOf = $void.signalOf
  var lambdaOf = $void.lambdaOf
  var functionOf = $void.functionOf
  var staticLambdaOf = $void.staticLambdaOf
  var staticOperator = $void.staticOperator

  // create lambda operator
  staticOperator('=', createOperator(lambdaOf, $Lambda.noop))

  // create static lambda (pure function) operator - reserved
  staticOperator('->', createOperator(staticLambdaOf, $Lambda.noop))

  // create function operator
  staticOperator('=>', createOperator(functionOf, $Function.noop))

  // call this function by tail-recursion (elimination)
  staticOperator('redo', signalOf('redo'))

  // leave function or module.
  staticOperator('return', signalOf('return'))

  // request to stop the execution of current module.
  staticOperator('exit', signalOf('exit'))

  // create the implementation
  function createOperator (funcOf, empty) {
    return function (space, clause) {
      var clist = clause.$
      var length = clist.length
      if (length < 2) {
        return empty
      }
      var params
      var offset
      if (clist[1] === $Symbol.pairing) {
        params = length > 2 ? clist[2] : $Tuple.empty
        offset = 2
      } else if (length > 2 && clist[2] === $Symbol.pairing) {
        params = clist[1]
        offset = 3
      } else {
        return funcOf(space, clause, 1)
      }
      // instant evaluation
      if (length <= (offset + 1)) {
        return null // no body
      }
      var func = funcOf(space, clause, offset)
      if (params instanceof Tuple$) {
        var plist = params.$
        if (plist.length < 1) {
          return func()
        }
        var args = []
        for (var i = 0; i < plist.length; i++) {
          args.push(evaluate(plist[i], space))
        }
        return func.apply(null, args)
      } else {
        return func(evaluate(params, space))
      }
    }
  }
}


/***/ }),

/***/ "./es/operators/general.js":
/*!*********************************!*\
  !*** ./es/operators/general.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function general ($void) {
  var $ = $void.$
  var $String = $.string
  var link = $void.link
  var Space$ = $void.Space
  var Symbol$ = $void.Symbol
  var operator = $void.operator
  var thisCall = $void.thisCall
  var evaluate = $void.evaluate
  var numberValueOf = $void.numberValueOf
  var staticOperator = $void.staticOperator

  var symbolSubject = $.symbol.subject

  staticOperator('+', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length > 1) {
      var base = evaluate(clist[1], space)
      return typeof base === 'number'
        ? sum(space, base, clist)
        : concat(space, base, clist)
    }
    return 0
  }, function (base, value) {
    var i = 1
    var len = arguments.length
    if (len < 1) {
      return 0
    }
    if (typeof base === 'number') {
      for (; i < len; i++) {
        value = arguments[i]
        base += typeof value === 'number' ? value : numberValueOf(value)
      }
    } else {
      if (typeof base !== 'string') {
        base = thisCall(base, 'to-string')
      }
      for (; i < len; i++) {
        value = arguments[i]
        base += typeof value === 'string' ? value : thisCall(value, 'to-string')
      }
    }
    return base
  })

  function concat (space, str, clist) {
    var length = clist.length
    if (typeof str !== 'string') {
      str = thisCall(str, 'to-string')
    }
    for (var i = 2; i < length; i++) {
      var value = evaluate(clist[i], space)
      str += typeof value === 'string' ? value : thisCall(value, 'to-string')
    }
    return str
  }

  function sum (space, num, clist) {
    var length = clist.length
    for (var i = 2; i < length; i++) {
      var value = evaluate(clist[i], space)
      num += typeof value === 'number' ? value : numberValueOf(value)
    }
    return num
  }

  // (str += str ... )
  link($String.proto, '+=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'string') {
      return '' // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      that += typeof value === 'string' ? value : thisCall(value, 'to-string')
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))

  // (str -= str ... ) or (str -= num)
  link($String.proto, '-=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that !== 'string') {
      return '' // The value of this operator is defined as 0.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    for (var i = base, len = clist.length; i < len; i++) {
      var value = evaluate(clist[i], space)
      if (typeof value === 'string') {
        if (that.endsWith(value)) {
          that = that.substring(0, that.length - value.length)
        }
      } else if (typeof value === 'number') {
        that = that.substring(0, that.length - value)
      } else {
        value = thisCall(value, 'to-string')
        if (that.endsWith(value)) {
          that = that.substring(0, that.length - value.length)
        }
      }
    }

    var sym = clist[base - 2]
    if (sym instanceof Symbol$) {
      space.let(sym.key, that)
    }
    return that
  }))
}


/***/ }),

/***/ "./es/operators/generator.js":
/*!***********************************!*\
  !*** ./es/operators/generator.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function generator ($void) {
  var $ = $void.$
  var Symbol$ = $void.Symbol
  var $export = $void.export
  var isFalsy = $void.isFalsy
  var isTruthy = $void.isTruthy
  var thisCall = $void.thisCall
  var evaluate = $void.evaluate
  var bindThis = $void.bindThis
  var indexerOf = $void.indexerOf
  var isApplicable = $void.isApplicable
  var numberValueOf = $void.numberValueOf
  var staticOperator = $void.staticOperator
  var tryToUpdateName = $void.tryToUpdateName

  var symbolPairing = $.symbol.pairing

  function noop (this_) {
    return this_
  }

  function generatorOf (op, impl, defaultOp) {
    impl || (impl = noop(function (space, clause) {
      var clist = clause.$
      switch (clist.length) {
        case 1:
          return function (this_) {
            return thisCall(this_, op)
          }
        case 2:
          var base = evaluate(clist[1], space)
          return function (this_) {
            return thisCall(this_, op, base)
          }
        default:
      }
      var args = []
      for (var i = 1, len = clist.length; i < len; i++) {
        args.push(evaluate(clist[i], space))
      }
      return function (this_) {
        return thisCall.apply(null, [this_, op].concat(args))
      }
    }))

    defaultOp || (defaultOp = noop(function (this_) {
      return arguments.length < 2 ? thisCall(this_, op)
        : thisCall.apply(null, [this_, op].concat(
          Array.prototype.slice.call(arguments, 1)
        ))
    }))

    return staticOperator(op, impl, defaultOp)
  }

  // universal operations
  staticOperator('===', generatorOf('is'), $['is'])
  staticOperator('!==', generatorOf('is-not'), $['is-not'])

  staticOperator('==', generatorOf('equals'), $['equals'])
  staticOperator('!=', generatorOf('not-equals'), $['not-equals'])

  generatorOf('compares-to')

  generatorOf('is-empty')
  generatorOf('not-empty')

  staticOperator('is-an', generatorOf('is-a'), $['is-a'])
  staticOperator('is-not-an', generatorOf('is-not-a'), $['is-not-a'])

  generatorOf('to-code')
  generatorOf('to-string')

  // comparer operations for number and string
  generatorOf('>')
  generatorOf('>=')
  generatorOf('<')
  generatorOf('<=')

  // arithmetic operators: -, ++, --, ...
  function arithmeticGeneratorOf (op) {
    var defaultOp = tryToUpdateName(function (this_) {
      return thisCall(this_, op)
    }, '*' + op)

    return staticOperator(op + '=', function (space, clause) {
      var clist = clause.$
      var length = clist.length
      if (length < 2) {
        return defaultOp
      }
      var args = []
      for (var i = 1; i < length; i++) {
        args.push(evaluate(clist[i], space))
      }
      return function (this_) {
        return thisCall.apply(null, [this_, op].concat(args))
      }
    }, function (a, b) {
      return typeof a === 'undefined' ? null
        : typeof b === 'undefined' ? thisCall(a, op) : thisCall(a, op, b)
    })
  }

  arithmeticGeneratorOf('+')
  arithmeticGeneratorOf('-')
  arithmeticGeneratorOf('*')
  arithmeticGeneratorOf('/')
  arithmeticGeneratorOf('%')

  // bitwise: ~, ...
  function safeBitwiseOpOf (op) {
    return function (a, b) {
      return op.call(typeof a === 'number' ? a : numberValueOf(a), b)
    }
  }

  function bitwiseGeneratorOf (key) {
    var op = $.number.proto[key]

    var defaultOp = tryToUpdateName(function (this_) {
      return op.call(typeof this_ === 'number' ? this_
        : numberValueOf(this_)
      )
    }, '*' + key)

    return staticOperator(key + '=', function (space, clause) {
      var clist = clause.$
      if (clist.length < 2) {
        return defaultOp
      }
      var value = evaluate(clist[1], space)
      return function (this_) {
        return op.call(typeof this_ === 'number' ? this_
          : numberValueOf(this_), value
        )
      }
    }, safeBitwiseOpOf(op))
  }

  bitwiseGeneratorOf('&')
  bitwiseGeneratorOf('|')
  bitwiseGeneratorOf('^')
  bitwiseGeneratorOf('<<')
  bitwiseGeneratorOf('>>')
  bitwiseGeneratorOf('>>>')

  // general: +, (str +=), (str -=)

  // logical operators: not, !, ...
  var defaultAnd = tryToUpdateName(function (this_) { return this_ }, '*&&')

  var logicalAnd = bindThis(null, function (a, b) {
    return typeof a === 'undefined' || (
      isFalsy(a) || typeof b === 'undefined' ? a : b
    )
  })

  var logicalAndAll = bindThis(null, function () {
    var factor
    for (var i = 0, len = arguments.length; i < len; i++) {
      factor = arguments[i]
      if (factor !== logicalAndAll && isFalsy(factor)) {
        return factor
      }
    }
    return typeof factor !== 'undefined' ? factor : true
  })

  var generatorAnd = staticOperator('&&', function (space, clause) {
    var clist = clause.$
    if (clist.length < 2) {
      return defaultAnd
    }
    var value
    for (var i = 1, len = clist.length; i < len; i++) {
      value = evaluate(clist[i], space)
      if (isFalsy(value)) {
        break
      }
    }
    return function (this_) {
      return logicalAnd(this_, value)
    }
  }, logicalAndAll)

  staticOperator('and', generatorAnd, logicalAndAll)
  staticOperator('&&=', generatorAnd, logicalAnd)

  var defaultOr = tryToUpdateName(function (this_) { return this_ }, '*||')

  var logicalOr = bindThis(null, function (a, b) {
    return typeof a !== 'undefined' && (
      isTruthy(a) || typeof b === 'undefined' ? a : b
    )
  })

  var logicalOrAny = bindThis(null, function () {
    var factor
    for (var i = 0, len = arguments.length; i < len; i++) {
      factor = arguments[i]
      if (factor !== logicalOrAny && isTruthy(factor)) {
        return factor
      }
    }
    return typeof factor !== 'undefined' ? factor : false
  })

  var generatorOr = staticOperator('||', function (space, clause) {
    var clist = clause.$
    if (clist.length < 2) {
      return defaultOr
    }
    var value
    for (var i = 1, len = clist.length; i < len; i++) {
      value = evaluate(clist[i], space)
      if (isTruthy(value)) {
        break
      }
    }
    return function (this_) {
      return logicalOr(this_, value)
    }
  }, logicalOrAny)

  staticOperator('or', generatorOr, logicalOrAny)
  staticOperator('||=', generatorOr, logicalOr)

  var booleanize = tryToUpdateName(bindThis(null, isTruthy), '*?')

  staticOperator('?', function (space, clause) {
    var clist = clause.$
    switch (clist.length) {
      case 0:
      case 1: // booleanize function.
        return booleanize
      case 2: // pre-defined boolean fallback
        var fallback = evaluate(clist[1], space)
        return function (this_) {
          return isTruthy(this_) ? this_ : fallback
        }
      default: // predefined boolean switch
        var truthy = evaluate(clist[1], space)
        var falsy = evaluate(clist[2], space)
        return function (this_) {
          return isTruthy(this_) ? truthy : falsy
        }
    }
  }, booleanize) // the entity is also the booleanize function.

  var booleanizeEmptiness = tryToUpdateName(function (this_) {
    return typeof this_ === 'undefined' || thisCall(this_, 'not-empty')
  }, '*?*')

  staticOperator('?*', function (space, clause) {
    var clist = clause.$
    switch (clist.length) {
      case 0:
      case 1:
        return booleanizeEmptiness
      case 2: // pre-defined emptiness fallback
        var fallback = evaluate(clist[1], space)
        return function (this_) {
          return thisCall(this_, 'not-empty') ? this_ : fallback
        }
      default: // predefined emptiness switch
        var truthy = evaluate(clist[1], space)
        var falsy = evaluate(clist[2], space)
        return function (this_) {
          return thisCall(this_, 'not-empty') ? truthy : falsy
        }
    }
  }, booleanizeEmptiness)

  var booleanizeNull = tryToUpdateName(function (this_) {
    return typeof this_ === 'undefined' || this_ !== null
  }, '*??')

  staticOperator('??', function (space, clause) {
    var clist = clause.$
    switch (clist.length) {
      case 0:
      case 1:
        return booleanizeNull
      case 2: // pre-defined null fallback
        var fallback = evaluate(clist[1], space)
        return function (this_) {
          return this_ !== null && typeof this_ !== 'undefined'
            ? this_ : fallback
        }
      default: // predefined emptiness switch
        var truthy = evaluate(clist[1], space)
        var falsy = evaluate(clist[2], space)
        return function (this_) {
          return this_ !== null && typeof this_ !== 'undefined' ? truthy : falsy
        }
    }
  }, booleanizeNull)

  // logical combinator
  function combine (factors, isNegative) {
    return function (this_) {
      var factor
      for (var i = 0, len = factors.length; i < len; i++) {
        factor = factors[i]
        factor = isApplicable(factor) ? factor(this_)
          : thisCall(this_, 'equals', factor)
        if (isNegative(factor)) {
          return factor
        }
      }
      return factor
    }
  }

  var alwaysTrue = function yes () { return true }

  var logicalAll = $export($, 'all', function () {
    var factors = []
    for (var i = 0, len = arguments.length; i < len; i++) {
      (arguments[i] !== logicalAndAll) && factors.push(arguments[i])
    }
    return factors.length < 1 ? alwaysTrue : combine(factors, isFalsy)
  })
  // both is only an alias of all.
  $export($, 'both', logicalAll)

  var alwaysFalse = function no () { return false }

  var logicalAny = $export($, 'any', function any () {
    var factors = []
    for (var i = 0, len = arguments.length; i < len; i++) {
      (arguments[i] !== logicalOrAny) && factors.push(arguments[i])
    }
    return factors.length < 1 ? alwaysFalse : combine(factors, isTruthy)
  })
  // either is only an alias of any.
  $export($, 'either', logicalAny)

  function combineNot (factors) {
    return function (this_) {
      var factor
      for (var i = 0, len = factors.length; i < len; i++) {
        factor = factors[i]
        factor = isApplicable(factor) ? isTruthy(factor(this_))
          : thisCall(this_, 'equals', factor)
        if (factor) {
          return false
        }
      }
      return true
    }
  }

  var logicalNotAny = $export($, 'not-any', function () {
    var factors = []
    for (var i = 0, len = arguments.length; i < len; i++) {
      (arguments[i] !== logicalOrAny) && factors.push(arguments[i])
    }
    return factors.length < 1 ? alwaysTrue : combineNot(factors)
  })
  // neither is only an alias of not-any.
  $export($, 'neither', logicalNotAny)
  // nor is only an alias of or for neither.
  $export($, 'nor', logicalOrAny)

  // general predictor
  staticOperator('*', function (space, clause) {
    var clist = clause.$
    var len = clist.length
    if (len < 2) {
      return null // (*) returns null.
    }
    var sym = clist[1]
    var i
    if (sym instanceof Symbol$) {
      i = 2; sym = sym.key
    } else {
      i = 1; sym = symbolPairing
    }
    var args = []
    for (; i < len; i++) {
      args.push(evaluate(clist[i], space))
    }
    return sym === symbolPairing
      // the same with the behavior of evaluate function.
      ? args.length < 1 ? function (this_) {
        return indexerOf(this_)()
      } : function (this_) {
        return indexerOf(this_).apply(this_, args)
      }
      // general this call generator.
      : args.length < 1 ? function (this_) {
        return thisCall(this_, sym)
      } : function (this_) {
        return thisCall.apply(null, [this_, sym].concat(args))
      }
  }, null) // being referred, * functions as a null.
}


/***/ }),

/***/ "./es/operators/import.js":
/*!********************************!*\
  !*** ./es/operators/import.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function import_ ($void) {
  var $ = $void.$
  var $Symbol = $.symbol
  var $Object = $.object
  var compile = $.compile
  var warn = $void.$warn
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var execute = $void.execute
  var evaluate = $void.evaluate
  var isObject = $void.isObject
  var ownsProperty = $void.ownsProperty
  var safelyAssign = $void.safelyAssign
  var sharedSymbolOf = $void.sharedSymbolOf
  var staticOperator = $void.staticOperator

  var symbolAll = $Symbol.all
  var symbolFrom = sharedSymbolOf('from')
  var symbolImport = sharedSymbolOf('import')

  // late binding: transient wrappers
  var nativeResolve = function $nativeResolve () {
    nativeResolve = $void.module.native.resolve.bind($void.module.native)
    return nativeResolve.apply(null, arguments)
  }
  var nativeLoad = function $nativeLoad () {
    nativeLoad = $void.module.native.load.bind($void.module.native)
    return nativeLoad.apply(null, arguments)
  }
  var dirname = function $dirname () {
    dirname = $void.$path.dirname.bind($void.$path)
    return dirname.apply(null, arguments)
  }

  // import a module.
  //   (import module), or
  //   (import field from module), or
  //   (import (fields ...) from module)
  var operator = staticOperator('import', function (space, clause) {
    if (!space.app) {
      warn('import', 'invalid without an app context.')
      return null
    }
    var clist = clause.$
    if (clist.length < 2) {
      return null
    }
    var module_
    if (clist.length < 3 || clist[2] !== symbolFrom) {
      // look into current space to have the base uri.
      module_ = importModule(space, evaluate(clist[1], space))
      // clone to protect inner exporting object.
      return module_ && referModule(module_)
    }
    // (import field-or-fields from target)
    var target = evaluate(clist[3], space)
    var imported
    if (isObject(target)) {
      module_ = null
      imported = target // expanding object fields.
    } else if (typeof target === 'string') {
      module_ = importModule(space, target)
      imported = module_ && module_.exporting
      if (!imported) {
        return null // importing failed.
      }
    } else {
      typeof target === 'undefined' || target === null
        ? warn('import', 'missing target object or path.')
        : warn('import', 'invalid target object or path:', target)
      return null
    }

    // find out fields
    var fields = clist[1]
    if (fields instanceof Symbol$) {
      return fields !== symbolAll ? imported[fields.key]
        : module_ ? referModule(module_) : imported
    }
    if (!(fields instanceof Tuple$)) {
      warn('import', 'invalid field descriptor.', fields)
      return null
    }

    var i
    var flist = fields.$
    fields = []
    for (i = 0; i < flist.length; i++) {
      if (flist[i] instanceof Symbol$) {
        fields.push(flist[i].key)
      }
    }
    // import fields into an array.
    var values = []
    for (i = 0; i < fields.length; i++) {
      var value = imported[fields[i]]
      values.push(typeof value === 'undefined' ? null : value)
    }
    return values
  })

  function referModule (module_) {
    var exporting = module_.exporting
    if (module_.isNative) {
      // not try to wrap a native module which is supposed to protect itself if
      // it intends so.
      return exporting
    }

    var ref = Object.create(exporting)
    for (var key in exporting) {
      // inner fields will not be copied by statement like:
      //   (var * (import "module"))
      if (!key.startsWith('-') && ownsProperty(exporting, key)) {
        ref[key] = exporting[key]
      }
    }
    return ref
  }

  function importModule (space, target) {
    if (typeof target !== 'string' || !target) {
      warn('import', 'invalid module identifer:', target)
      return null
    }
    var srcModuleUri = space.local['-module']
    var srcModuleDir = space.local['-module-dir']

    var isNative = target.startsWith('$')
    var appModules = space.app.modules
    var uri = isNative
      ? nativeResolve(target, srcModuleDir,
        space.local['-app-home'],
        space.local['-app-dir'],
        $void.$env('user-home')
      )
      : appModules.resolve(target, srcModuleDir)
    if (!uri) {
      // any warning should be recorded in resolving process.
      return null
    }

    // look up it in cache.
    var module_ = appModules.lookupInCache(uri, srcModuleUri)
    if (module_.status) {
      return module_
    }

    module_.status = 100 // indicate loading
    module_.exporting = (isNative ? loadNativeModule : loadModule)(
      space, uri, module_, target, srcModuleUri
    )
    // make sure system properties cannot be overridden.
    if (!module_.exporting) {
      module_.exporting = Object.create($Object.proto)
    }
    if (!module_.isNative) {
      Object.assign(module_.exporting, module_.props)
    }
    return module_
  }

  function loadModule (space, uri, module_, target, moduleUri) {
    try {
      module_.props['-module'] = uri
      module_.props['-module-dir'] = dirname(uri)
      // try to load file
      var doc = $void.loader.load(uri)
      var text = doc[0]
      if (typeof text !== 'string') {
        module_.status = 415 // unsupported media type
        warn('import', 'failed to read', target, 'for', doc[1])
        return null
      }
      // compile text
      var code = compile(text, uri, doc[1])
      if (!(code instanceof Tuple$)) {
        module_.status = 400 //
        warn('import', 'failed to compile', target, 'for', code)
        return null
      }
      // to load module
      var scope = execute(space, code, uri)[1] // ignore evaluation result.
      if (scope) {
        module_.status = 200
        return scope.exporting
      }
      module_.status = 500
      warn('import', 'failed when executing', code)
    } catch (signal) {
      module_.status = 503
      warn('import', 'invalid call to', signal.id,
        'in', code, 'at', uri, 'from', moduleUri)
    }
    return null
  }

  function loadNativeModule (space, uri, module_, target, moduleUri) {
    try {
      // the native module must export a loader function.
      module_.isNative = true
      module_.props['-module'] = uri
      var exporting = nativeLoad(uri)
      module_.status = 200
      return typeof exporting !== 'function' ? exporting
        : safelyAssign(Object.create(null), exporting)
    } catch (err) {
      module_.status = 503 // service unavailable
      warn('import', 'failed to import native module of', target,
        'for', err, 'at', uri, 'from', moduleUri)
    }
    return null
  }

  $void.bindOperatorImport = function (space) {
    return (space.$import = function (uri) {
      if (!uri || typeof uri !== 'string') {
        warn('$import', 'invalid module uri:', uri)
        return null
      }
      return operator(space, new Tuple$([symbolImport, uri]))
    })
  }
}


/***/ }),

/***/ "./es/operators/literal.js":
/*!*********************************!*\
  !*** ./es/operators/literal.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function literal ($void) {
  var $ = $void.$
  var $Class = $.class
  var $Object = $.object
  var $Symbol = $.symbol
  var symbolOf = $Symbol.of
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var ClassType$ = $void.ClassType
  var thisCall = $void.thisCall
  var evaluate = $void.evaluate
  var arraySet = $.array.proto.set
  var sharedSymbolOf = $void.sharedSymbolOf
  var staticOperator = $void.staticOperator

  var symbolAll = $Symbol.all
  var symbolLiteral = $Symbol.literal
  var symbolPairing = $Symbol.pairing

  var symbolMap = sharedSymbolOf('map')
  var symbolSet = sharedSymbolOf('set')
  var symbolArray = sharedSymbolOf('array')
  var symbolClass = sharedSymbolOf('class')
  var symbolObject = sharedSymbolOf('object')

  // late binding
  var $warn = function warn () {
    $warn = $void.$warn
    return $warn.apply($void, arguments)
  }

  // (@ value ...)
  function arrayCreate (space, clist, offset) {
    var result = []
    var index, value
    while (offset < clist.length) {
      value = evaluate(clist[offset++], space)
      if (offset < clist.length && clist[offset] === symbolPairing) {
        offset += 1
        index = typeof value === 'number' ? value >> 0 : result.length
        arraySet.call(result, index, offset >= clist.length ? null
          : evaluate(clist[offset++], space)
        )
      } else {
        result.push(value)
      }
    }
    return result
  }

  // (@:set value ...)
  function setCreate (space, clist, offset) {
    var result = new Set()
    while (offset < clist.length) {
      result.add(evaluate(clist[offset++], space))
    }
    return result
  }

  // (@:map symbol: value ...)
  function mapCreate (space, clist, offset) {
    var map = new Map()
    var length = clist.length
    while (offset < length) {
      var key = evaluate(clist[offset++], space)
      if (clist[offset] === symbolPairing && (++offset <= length)) {
        map.set(key, evaluate(clist[offset++], space))
      } else {
        map.set(key, null)
      }
    }
    return map
  }

  // (@ symbol: value ...)
  function objectCreate (space, clist, type, offset) {
    var obj = type.empty()
    var length = clist.length
    while (offset < length) {
      var name = clist[offset++]
      if (name instanceof Symbol$) {
        name = name.key
      } else if (typeof name !== 'string') {
        if (name instanceof Tuple$) {
          name = evaluate(name, space)
        }
        if (name instanceof Symbol$) {
          name = name.key
        } else if (typeof name !== 'string') {
          name = thisCall(name, 'to-string')
        }
      }
      if (clist[offset] === symbolPairing) {
        obj[name] = ++offset < length ? evaluate(clist[offset++], space) : null
      } else {
        obj[name] = evaluate(symbolOf(name), space)
      }
    }
    // activate a typed object
    var activator = type.proto.activator
    if (typeof activator === 'function') {
      activator.call(obj, obj)
    }
    return obj
  }

  function tryToCreateInstance (space, clist, type, offset) {
    if (!(type instanceof ClassType$)) {
      $warn('@-literal', 'invalid literal type', [typeof type, type])
      type = $Object // downgrade an unknown type to a common object.
    }
    return objectCreate(space, clist, type, offset)
  }

  staticOperator('@', function (space, clause) {
    var clist = clause.$
    var length = clist.length
    if (length < 2) { // (@)
      return []
    }
    var indicator = clist[1]
    if (indicator !== symbolPairing) {
      return length <= 2 || clist[2] !== symbolPairing ||
          typeof indicator === 'number' || indicator instanceof Tuple$
        // implicit array: (@ ...), or discrete array: (@ offset: value ...)
        ? arrayCreate(space, clist, 1)
        // implicit object: (@ name: ...) or (@ "name": ...)
        : objectCreate(space, clist, $Object, 1)
    }
    // (@: ...)
    if (length < 3) { // (@:)
      return Object.create($Object.proto)
    }
    // (@:a-type ...)
    var type = clist[2]
    return type === symbolClass
      // class declaration: (@:class ...)
      ? $Class.of(objectCreate(space, clist, $Object, 3))
      : type === symbolLiteral || type === symbolObject
        // explicit object: (@:@ ...) (@:object ...)
        ? objectCreate(space, clist, $Object, 3)
        : type === symbolAll || type === symbolArray
          // mandatory array: (@:* ...) (@:array ...)
          ? arrayCreate(space, clist, 3)
          // set literal: (@:set ...)
          : type === symbolSet ? setCreate(space, clist, 3)
            // set literal: (@:set ...)
            : type === symbolMap ? mapCreate(space, clist, 3)
              // class instance: (@:a-class ...)
              : tryToCreateInstance(space, clist, evaluate(type, space), 3)
  })
}


/***/ }),

/***/ "./es/operators/load.js":
/*!******************************!*\
  !*** ./es/operators/load.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function load ($void) {
  var $ = $void.$
  var compile = $.compile
  var Tuple$ = $void.Tuple
  var warn = $void.$warn
  var execute = $void.execute
  var evaluate = $void.evaluate
  var sharedSymbolOf = $void.sharedSymbolOf
  var staticOperator = $void.staticOperator

  var symbolLoad = sharedSymbolOf('load')

  // load a module
  var operator = staticOperator('load', function (space, clause) {
    if (!space.app) {
      warn('load', 'invalid without an app context.')
      return null
    }
    var clist = clause.$
    if (clist.length < 2) {
      return null
    }
    // look into current space to have the base uri.
    return loadData(space, space.local['-module-dir'],
      evaluate(clist[1], space),
      clist.length > 2 ? evaluate(clist[2], space) : null
    )
  })

  function loadData (space, srcModuleDir, target, args) {
    if (!target || typeof target !== 'string') {
      warn('load', 'invalid module identifer:', target)
      return null
    }
    // try to locate the target uri
    var uri = space.app.modules.resolve(target, srcModuleDir)
    if (!uri) {
      return null
    }
    // try to load file
    var doc = $void.loader.load(uri)
    var text = doc[0]
    if (!text) {
      warn('load', 'failed to load', target, 'for', doc[1])
      return null
    }
    // compile text
    var code = compile(text, uri, doc[1])
    if (!(code instanceof Tuple$)) {
      warn('load', 'compiler warnings:', code)
      return null
    }

    try { // to load data
      var result = execute(space, code, uri,
        Array.isArray(args) ? args.slice() : args)
      var scope = result[1]
      return scope && Object.getOwnPropertyNames(scope.exporting).length > 0
        ? scope.exporting : result[0]
    } catch (signal) {
      warn('load', 'invalid call to', signal.id,
        'in', code, 'from', uri, 'in', srcModuleDir)
      return null
    }
  }

  $void.bindOperatorLoad = function (space) {
    return (space.$load = function (uri) {
      if (!uri || typeof uri !== 'string') {
        warn('$load', 'invalid module uri:', uri)
        return null
      }
      return operator(space, new Tuple$([symbolLoad, uri]))
    })
  }
}


/***/ }),

/***/ "./es/operators/logical.js":
/*!*********************************!*\
  !*** ./es/operators/logical.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function logical ($void) {
  var $ = $void.$
  var $Type = $.type
  var $Bool = $.bool
  var Null = $void.null
  var link = $void.link
  var Space$ = $void.Space
  var Symbol$ = $void.Symbol
  var isFalsy = $void.isFalsy
  var operator = $void.operator
  var evaluate = $void.evaluate
  var thisCall = $void.thisCall
  var staticOperator = $void.staticOperator

  var symbolSubject = $.symbol.subject

  staticOperator('not', staticOperator('!', function (space, clause) {
    if (clause.$.length < 2) {
      return false
    }
    var value = evaluate(clause.$[1], space)
    return value === false || value === null || value === 0
  }, isFalsy), isFalsy)

  // global logical AND operator
  var logicalAnd = link(Null, ['&&', 'and'], operator(function (
    space, clause, that
  ) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return true
    }
    if (that === false || that === null || that === 0) {
      return that
    }

    var clist = clause.$
    var i = clist[0] === symbolSubject ? 3 : 2
    for (var len = clist.length; i < len; i++) {
      that = evaluate(clist[i], space)
      if (that === false || that === null || that === 0) {
        return that
      }
    }
    return that
  }))

  link(Null, '&&=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return true
    }

    var result = logicalAnd(space, clause, that)
    if (!Object.is(that, result)) {
      var clist = clause.$
      var sym = clist[clist[0] === symbolSubject ? 1 : 0]
      if (sym instanceof Symbol$) {
        space.let(sym.key, result)
      }
    }
    return result
  }))

  // global logical OR operator
  var logicalOr = link(Null, ['||', 'or'], operator(function (
    space, clause, that
  ) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return false
    }
    if (that !== false && that !== null && that !== 0) {
      return that
    }

    var clist = clause.$
    var i = clist[0] === symbolSubject ? 3 : 2
    for (var len = clist.length; i < len; i++) {
      that = evaluate(clist[i], space)
      if (that !== false && that !== null && that !== 0) {
        return that
      }
    }
    return that
  }))

  link(Null, '||=', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return false
    }

    var result = logicalOr(space, clause, that)
    if (!Object.is(that, result)) {
      var clist = clause.$
      var sym = clist[clist[0] === symbolSubject ? 1 : 0]
      if (sym instanceof Symbol$) {
        space.let(sym.key, result)
      }
    }
    return result
  }))

  // Boolean Test.
  // (x ?) - booleanize, returns true or false.
  // (x ? y) - boolean fallback, returns x itself or returns y if x is equivalent to false.
  // (x ? y z) - boolean switch, returns y if x is equivalent to true, returns z otherwise.
  link(Null, '?', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return true // defined as true.
    }
    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    if (clist.length < base) {
      return true // defined as true
    }

    if (that !== false && that !== null && that !== 0) {
      switch (clist.length - base) { // true logic
        case 0:
          return true
        case 1:
          return that
        default:
          return evaluate(clist[base], space)
      }
    }

    switch (clist.length - base) { // false logic
      case 0:
        return false
      case 1:
        return evaluate(clist[base], space)
      default:
        return evaluate(clist[base + 1], space)
    }
  }))

  // Emptiness Test.
  // (x ?*) - booleanized emptiness, returns true or false.
  // x ?* y) - emptiness fallback, returns x itself or returns y if x is empty.
  // (x ?* y z) - emptiness switch, returns y if x is not an empty value, returns z otherwise.
  link(Null, '?*', operator(function (space, clause, that) {
    if (!(space instanceof Space$) || typeof that === 'undefined') {
      return true // defined as true.
    }
    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    if (clist.length < base) {
      return true // defined as true
    }

    if (thisCall(that, 'not-empty')) {
      switch (clist.length - base) { // true logic
        case 0:
          return true
        case 1:
          return that
        default:
          return evaluate(clist[base], space)
      }
    }
    switch (clist.length - base) { // false logic
      case 0:
        return false
      case 1:
        return evaluate(clist[base], space)
      default:
        return evaluate(clist[base + 1], space)
    }
  }))

  // Null Test.
  // (x ??) - booleanize null, returns true or false.
  // (x ?? y) - null fallback, returns x itself or returns y if x is null.
  // (null ?? y z ...) returns the first non-null value after it if x is null.
  link(Null, '??', operator(function (space, clause, that) {
    if (!(space instanceof Space$)) {
      return true // defined as true.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    if (clist.length < base) {
      return true // defined as true
    }

    switch (clist.length - base) {
      case 0: // booleanize
        return false
      case 1: // fallback
        return evaluate(clist[base], space)
      default: // (falsy) switch
        return evaluate(clist[base + 1], space)
    }
  }))

  // for all non-null values.
  link($Type.proto, '??', operator(function (space, clause, that) {
    if (!(space instanceof Space$)) {
      return true // defined as true.
    }

    var clist = clause.$
    var base = clist[0] === symbolSubject ? 3 : 2
    if (clist.length < base) {
      return true // defined as true
    }

    switch (clist.length - base) {
      case 0: // booleanize
        return true
      case 1: // (no) fallback
        return that
      default: // (truthy) switch
        return evaluate(clist[base], space)
    }
  }))

  // Boolean value verification helpers.
  link($Bool.proto, 'fails', operator(function (space, clause, that) {
    return typeof that === 'boolean' ? !that : true
  }))
  link($Bool.proto, 'succeeds', operator(function (space, clause, that) {
    return typeof that === 'boolean' ? that : false
  }))
}


/***/ }),

/***/ "./es/operators/operator.js":
/*!**********************************!*\
  !*** ./es/operators/operator.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function operator ($void) {
  var $ = $void.$
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var $Operator = $.operator
  var evaluate = $void.evaluate
  var operatorOf = $void.operatorOf
  var staticOperator = $void.staticOperator

  // create the operator to define an operator
  staticOperator('=?', function (space, clause) {
    return clause.$.length < 2 ? $Operator.noop : operatorOf(space, clause)
  })

  // To resolve a symbol from the original declaration space of an operator.
  // It's designed to be used in an operator, but it falls back to the result of
  // applying operator ".." if it's called in a non-operator space.
  staticOperator('.', function (space, clause) {
    var clist = clause.$
    if (clist.length > 1) {
      var sym = clist[1]
      if (sym instanceof Tuple$) {
        sym = evaluate(sym, space)
      }
      if (sym instanceof Symbol$) {
        return space.$resolve(sym.key)
      }
    }
    return null
  })
}


/***/ }),

/***/ "./es/operators/pattern.js":
/*!*********************************!*\
  !*** ./es/operators/pattern.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function pattern ($void) {
  var $ = $void.$
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var evaluate = $void.evaluate
  var staticOperator = $void.staticOperator

  // pseudo explicit subject pattern operator '$'.
  staticOperator('$', function () {
    return null // It's implemented in evaluation function.
  })

  // pseudo explicit operation pattern operator ':'.
  staticOperator(':', function () {
    return null // It's implemented in evaluation function.
  })

  // try to resolve a symbol from the global space.
  staticOperator('..', function (space, clause) {
    var clist = clause.$
    if (clist.length > 1) {
      var sym = clist[1]
      if (sym instanceof Tuple$) {
        sym = evaluate(sym, space)
      }
      if (sym instanceof Symbol$) {
        return $[sym.key]
      }
    }
    return null
  })
}


/***/ }),

/***/ "./es/operators/quote.js":
/*!*******************************!*\
  !*** ./es/operators/quote.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function quote ($void) {
  var $ = $void.$
  var $Tuple = $.tuple
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var staticOperator = $void.staticOperator

  // (` symbol), (` value) or (` (...))
  staticOperator('`', function (space, clause) {
    return clause.$.length > 1 ? clause.$[1] : $Symbol.empty
  })

  // (quote symbol-or-value ...)
  staticOperator('quote', function (space, clause) {
    return clause._quoted || (
      clause._quoted = clause.$.length < 2 ? $Tuple.empty
        : new Tuple$(clause.$.slice(1), false, clause.source)
    )
  })

  // (unquote symbol-or-value ...)
  staticOperator('unquote', function (space, clause) {
    return clause._quoted || (
      clause._quoted = clause.$.length < 2 ? $Tuple.blank
        : new Tuple$(clause.$.slice(1), true, clause.source)
    )
  })
}


/***/ }),

/***/ "./es/runtime/env.js":
/*!***************************!*\
  !*** ./es/runtime/env.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var packageInfo = __webpack_require__(/*! ../../package.json */ "./package.json")

module.exports = function runtime ($void) {
  var $ = $void.$
  var $export = $void.export
  var emptyObject = $.object.empty

  var environment = Object.assign(Object.create(null), {
    'runtime-core': 'js',
    'runtime-host': $void.isNativeHost ? 'native' : 'browser',
    'runtime-version': packageInfo.version,
    'is-debugging': true,
    'logging-level': 3
  })

  // this will be put into app space only.
  $void.$env = $export($void.$app, 'env', function (name, defaulue) {
    return typeof name === 'undefined' || name === null
      ? Object.assign(emptyObject(), environment)
      : typeof name !== 'string' ? null
        : typeof environment[name] !== 'undefined' ? environment[name]
          : typeof defaulue !== 'undefined' ? defaulue : null
  })

  // allow runtime to update environment.
  $void.env = function (name, value) {
    return typeof value === 'undefined' ? environment[name]
      : (environment[name] = value)
  }
}


/***/ }),

/***/ "./es/runtime/eval.js":
/*!****************************!*\
  !*** ./es/runtime/eval.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function run ($void) {
  var $ = $void.$
  var compile = $.compile
  var Tuple$ = $void.Tuple
  var Symbol$ = $void.Symbol
  var warn = $void.$warn
  var $export = $void.export
  var execute = $void.execute

  // evaluate: a string, a symbol or a tuple in a separate space.
  $export($, 'eval', function (expr) {
    var code
    if (typeof expr === 'string') {
      // try to compile & evaluate
      code = compile(expr)
      if (!(code instanceof Tuple$)) {
        warn('eval', 'invalid code', code)
        return null
      }
    } else if (expr instanceof Tuple$) {
      // evaluate it
      code = expr
    } else if (expr instanceof Symbol$) {
      // resolve it in global space.
      code = new Tuple$([expr], true)
    } else {
      // a fix-point value.
      return expr
    }
    try {
      return execute(null, code)[0]
    } catch (signal) { // any unexpected signal
      if (code === expr) {
        warn('eval', 'invalid call to', signal.id, 'for', code)
      } else {
        warn('eval', 'invalid call to', signal.id, 'for', code, 'of', expr)
      }
      return null
    }
  })
}


/***/ }),

/***/ "./es/runtime/evaluate.js":
/*!********************************!*\
  !*** ./es/runtime/evaluate.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function evaluate ($void) {
  var $ = $void.$
  var $Operator = $.operator
  var Tuple$ = $void.Tuple
  var Signal$ = $void.Signal
  var Symbol$ = $void.Symbol
  var warn = $void.$warn
  var indexerOf = $void.indexerOf
  var symbolPairing = $.symbol.pairing
  var symbolSubject = $.symbol.subject
  var staticOperators = $void.staticOperators

  $void.evaluate = function evaluate (clause, space) {
    if (!(clause instanceof Tuple$)) {
      return clause instanceof Symbol$ ? space.resolve(clause.key) : clause
    }
    var clist = clause.$
    var length = clist.length
    if (length < 1) { // empty clause
      return null
    }
    if (clause.plain) { // a plain expression list (code block)
      var last = null
      for (var i = 0; i < length; i++) {
        last = evaluate(clist[i], space)
      }
      return last
    }
    // The subject and evaluation mode:
    //  implicit: the subject will be invoked if it's a function
    //  explicit: the subject keeps as a subject even it's a function.
    var subject = clist[0]
    var offset = 1
    var implicitSubject = true // by default, use implicit mode.
    if (subject instanceof Symbol$) {
      if (subject === symbolSubject) { // switching to explicit mode.
        switch (length) {
          case 1:
            return null // no subject.
          case 2:
            return evaluate(clist[1], space)
          default:
            subject = evaluate(clist[1], space)
        }
        offset = 2
        implicitSubject = false // explicit mode
      } else if (subject === symbolPairing) { // switching to explicit mode.
        if (length < 2) {
          return null // no predicate.
        }
        subject = evaluate(clist[1], space)
        if (typeof subject !== 'function') {
          return null // invalid operation
        }
        offset = 2
      } else if (staticOperators[subject.key]) { // static operators
        return staticOperators[subject.key](space, clause)
      } else { // a common symbol
        subject = space.resolve(subject.key)
      }
    } else if (subject instanceof Tuple$) { // a statement
      subject = evaluate(subject, space)
    } // else, the subject is a common value.

    // switch subject to predicate if it's applicable.
    var predicate
    if (typeof subject === 'function' && implicitSubject) {
      if (subject.type === $Operator) {
        return subject(space, clause)
      }
      predicate = subject
      subject = null
    } else {
      predicate = null
    }

    // with only subject, apply evaluation to it.
    if (offset >= length && predicate === null) {
      return evaluate(subject, space) // explicitly calling this function.
    }

    var args = []
    if (predicate === null) { // resolve the predicate if there is not.
      predicate = clist[offset++]
      if (predicate instanceof Tuple$) { // nested clause
        predicate = evaluate(predicate, space)
      }
      // try to find a function as verb
      if (predicate instanceof Symbol$) {
        if (predicate.key === ':') {
          predicate = indexerOf(subject) // explicitly calling the indexer
        } else { // implicitly call the indexer
          var indexer = indexerOf(subject)
          predicate = indexer.get
            ? indexer.get.call(subject, predicate.key)
            : indexer.call(subject, predicate.key)
          if (typeof predicate !== 'function') {
            // interpret to getter if the result is not a function.
            return typeof predicate === 'undefined' ? null : predicate
          }
        }
      } else if (typeof predicate !== 'function') {
        args.push(predicate)
        predicate = indexerOf(subject)
      }
    }

    // pass the original clause if the predicate is an operator.
    if (predicate.type === $Operator) {
      return predicate(space, clause, subject)
    }

    // evaluate arguments.
    for (; offset < length; offset++) {
      args.push(evaluate(clist[offset], space))
    }

    // evaluate the statement.
    try {
      var result = predicate.apply(subject, args)
      return typeof result === 'undefined' ? null : result
    } catch (signal) {
      if (signal instanceof Signal$) {
        throw signal
      }
      warn('evaluate', 'unknown signal:', signal, 'when evaluating', clause)
      return null
    }
  }
}


/***/ }),

/***/ "./es/runtime/execute.js":
/*!*******************************!*\
  !*** ./es/runtime/execute.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function execute ($void) {
  var Signal$ = $void.Signal
  var warn = $void.$warn
  var evaluate = $void.evaluate
  var createAppSpace = $void.createAppSpace
  var createModuleSpace = $void.createModuleSpace

  $void.execute = function execute (space, code, uri, args, appHome) {
    var scope = appHome ? prepareAppSpace(uri, appHome) : createModuleSpace(uri, space)
    scope.populate(args)
    try {
      return [evaluate(code, scope), scope]
    } catch (signal) {
      if (signal instanceof Signal$) {
        if (signal.id === 'exit' || signal.id === 'return') {
          return [signal.value, scope]
        }
        throw signal
      }
      warn('execute', 'unknown error:', signal,
        'with', args, 'for', code, 'from', uri
      )
      return [null, null]
    }
  }

  function prepareAppSpace (uri, appHome) {
    var scope = $void.bootstrap
    if (scope && scope['-app'] === uri) { // bootstrap app
      if (scope.app.modules.cache[uri]) { // re-run the bootstrap app
        scope = createAppSpace(uri, appHome)
      } // start to run bootstrap app
    } else { // a new app
      scope = createAppSpace(uri, appHome)
    }
    scope.app.modules.cache[uri] = Object.assign(Object.create(null), {
      status: 201,
      exports: scope.exporting,
      timestamp: Date.now()
    })
    return scope
  }
}


/***/ }),

/***/ "./es/runtime/function.js":
/*!********************************!*\
  !*** ./es/runtime/function.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function function_ ($void) {
  var $ = $void.$
  var $Tuple = $.tuple
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var Signal$ = $void.Signal
  var Symbol$ = $void.Symbol
  var warn = $void.$warn
  var lambda = $void.lambda
  var stambda = $void.stambda
  var constambda = $void.constambda
  var evaluate_ = $void.evaluate
  var function_ = $void.function
  var ownsProperty = $void.ownsProperty
  var createLambdaSpace = $void.createLambdaSpace
  var createFunctionSpace = $void.createFunctionSpace
  var createEmptyOperation = $void.createEmptyOperation

  var alignWithGeneric = isFunctionLengthWritable()
    ? alignWithGenericDefault
    : alignWithGenericFallback

  function evaluate (tbody, scope) {
    var retval = evaluate_(tbody, scope)
    return ownsProperty(scope.context, 'retval') ? scope.context.retval : retval
  }

  $void.lambdaOf = function lambdaOf (space, clause, offset) {
    // compile code
    var code = [$Symbol.lambda]
    var params = formatParameters(clause.$[offset++], space)
    code.push(params[1])
    params = params[0]
    var body = clause.$.slice(offset) || []
    if (body.length > 0) {
      var tbody = new Tuple$(body, true)
      code.push(tbody)
      return lambda(createLambda(
        params, tbody, space.app, space.local['-module']
      ), new Tuple$(code))
    } else {
      code.push($Tuple.blank) // empty body
      return params.length < 1 ? $.lambda.noop
        : lambda(createEmptyOperation(), new Tuple$(code))
    }
  }

  function createLambda (params, tbody, app, module_) {
    var createScope = createLambdaSpace.bind(null, app, app && app.modules.cache, module_)
    var $lambda = function () {
      var scope = createScope()
      // populate arguments
      for (var i = 0; i < params.length; i++) {
        scope.local[params[i]] = i < arguments.length ? arguments[i] : null
      }
      scope.prepare($lambda, this, Array.prototype.slice.call(arguments))
      // execution
      while (true) { // redo
        try {
          return evaluate(tbody, scope)
        } catch (signal) {
          if (signal instanceof Signal$) {
            if (signal.id === 'redo') { // clear space context
              scope = prepareToRedo(createScope(),
                $lambda, this, params, signal.value, signal.count)
              continue
            } else if (signal.id !== 'exit') {
              // return, break & continue if they're not in loop.
              return signal.value
            }
            throw signal
          }
          warn('lambda:eval', 'unexpected error:', signal)
          return null
        }
      }
    }
    return alignWithGeneric($lambda, params.length)
  }

  $void.staticLambdaOf = function staticLambdaOf (space, clause, offset) {
    // compile code
    var code = [$Symbol.stambda]
    var params = formatParameters(clause.$[offset++], space, 1)
    code.push(params[1])
    params = params[0]
    var body = clause.$.slice(offset) || []
    if (body.length > 0) {
      var tbody = new Tuple$(body, true)
      code.push(tbody)
      return (params.length > 0 ? stambda : constambda)(
        createStaticLambda(params, tbody), new Tuple$(code)
      )
    } else {
      code.push($Tuple.blank) // empty body
      return params.length < 1 ? $.lambda.static
        : constambda(createEmptyOperation(), new Tuple$(code))
    }
  }

  function createStaticLambda (params, tbody) {
    var key
    if (params.length > 0) {
      key = params[0]
    }
    var $stambda = function () {
      var scope = createLambdaSpace()
      // populate argument
      if (key) {
        key === 'this'
          ? (scope.context.this = this)
          : (scope.local[key] =
            typeof arguments[0] === 'undefined' ? null : arguments[0]
          )
      }
      // execution
      try {
        return evaluate(tbody, scope)
      } catch (signal) {
        if (signal instanceof Signal$) {
          if (signal.id !== 'exit') {
            // redo, return, break & continue if they're not in loop.
            return signal.value
          }
          throw signal
        }
        warn('stambda:eval', 'unexpected error:', signal)
        return null
      }
    }
    if (key === 'this') {
      return $stambda
    }
    $stambda = $stambda.bind(null)
    $stambda.this = null
    return alignWithGeneric($stambda, params.length)
  }

  $void.functionOf = function functionOf (space, clause, offset) {
    // compile code
    var code = [$Symbol.function]
    var params = formatParameters(clause.$[offset++], space)
    code.push(params[1])
    params = params[0]
    var body = clause.$.slice(offset) || []
    if (body.length > 0) {
      var tbody = new Tuple$(body, true)
      code.push(tbody)
      return function_(
        createFunction(params, tbody, space.reserve()),
        new Tuple$(code)
      )
    } else {
      code.push($Tuple.blank) // empty body
      return params.length < 1 ? $.function.noop
        : function_(createEmptyOperation(), new Tuple$(code))
    }
  }

  function createFunction (params, tbody, parent) {
    var $func = function () {
      var scope = createFunctionSpace(parent)
      // populate arguments
      for (var i = 0; i < params.length; i++) {
        scope.local[params[i]] = i < arguments.length ? arguments[i] : null
      }
      scope.prepare($func, this, Array.prototype.slice.call(arguments))
      // execution
      while (true) { // redo
        try {
          return evaluate(tbody, scope)
        } catch (signal) {
          if (signal instanceof Signal$) {
            if (signal.id === 'redo') { // clear space context
              scope = prepareToRedo(createFunctionSpace(parent),
                $func, this, params, signal.value, signal.count)
              continue
            } else if (signal.id !== 'exit') {
              // return, break & continue if they're not in loop.
              return signal.value
            }
            throw signal
          } // for unexpected errors
          warn('function:eval', 'unexpected error:', signal)
          return null
        }
      }
    }
    return alignWithGeneric($func, params.length)
  }

  // to prepare a new context for redo
  function prepareToRedo (scope, me, t, params, value, count) {
    var args = count === 0 ? [] : count === 1 ? [value] : value
    scope.prepare(me, t, args)
    for (var i = 0; i < params.length; i++) {
      scope.local[params[i]] = i < args.length ? args[i] : null
    }
    return scope
  }

  // accepts param, (param ...) or ((param default-value) ...)
  // returns [params-list, code]
  function formatParameters (params, space, maxArgs) {
    if (params instanceof Symbol$) {
      return [[params.key], new Tuple$([params])]
    }
    if (!(params instanceof Tuple$) || params.$.length < 1) {
      return [[], $Tuple.empty]
    }
    params = params.$
    maxArgs = maxArgs > 0
      ? maxArgs > params.length ? params.length : maxArgs
      : params.length
    var args = []
    var code = []
    for (var i = 0; i < maxArgs; i++) {
      var param = params[i]
      if (param instanceof Symbol$) {
        args.push(param.key)
        code.push(param)
      }
    }
    return args.length > 0 ? [args, new Tuple$(code)] : [[], $Tuple.empty]
  }

  function isFunctionLengthWritable () {
    var func = function () {}
    try {
      Object.defineProperty(func, 'length', { value: 2 })
      return true
    } catch (err) {
      // fortunately, this should only happen in IE, ...
      warn('runtime/function', 'function\'s length is not writable.', err)
      return false
    }
  }

  function alignWithGenericDefault (func, paramNo) {
    return paramNo > 0 ? Object.defineProperties(func, {
      length: {
        value: paramNo
      },
      name: {
        value: undefined
      }
    }) : Object.defineProperty(func, 'name', {
      value: undefined
    })
  }

  function alignWithGenericFallback (func, paramNo) {
    Object.defineProperty(func, 'length', { value: paramNo })
    return !func.name ? func
      : Object.defineProperty(func, 'name', { value: undefined })
  }
}


/***/ }),

/***/ "./es/runtime/operator.js":
/*!********************************!*\
  !*** ./es/runtime/operator.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function operators$operator ($void) {
  var $ = $void.$
  var $Tuple = $.tuple
  var $Symbol = $.symbol
  var Tuple$ = $void.Tuple
  var Space$ = $void.Space
  var Symbol$ = $void.Symbol
  var evaluate = $void.evaluate
  var operator = $void.operator
  var symbolPairing = $Symbol.pairing
  var symbolSubject = $Symbol.subject
  var createOperatorSpace = $void.createOperatorSpace
  var createEmptyOperation = $void.createEmptyOperation

  $void.operatorOf = function operatorOf (space, clause) {
    // compile code
    var code = [$Symbol.operator]
    var params = formatOperands(clause.$[1])
    code.push(params[1])
    params = params[0]
    var body = clause.$.slice(2) || []
    if (body.length > 0) {
      markOperatorClause(body)
      var tbody = new Tuple$(body, true)
      code.push(tbody)
      return operator(createOperator(params, tbody, space.local), new Tuple$(code))
    } else {
      code.push($Tuple.blank) // empty body
      return params.length < 1 ? $.operator.noop
        : operator(createEmptyOperation(), new Tuple$(code))
    }
  }

  function markOperatorClause (statement) {
    for (var i = 0; i < statement.length; i++) {
      var expr = statement[i]
      if (expr instanceof Tuple$ && expr.$.length > 0) {
        expr.inop = true
        markOperatorClause(expr.$)
      }
    }
  }

  function createOperator (params, tbody, origin) {
    return function (space, clause, that) {
      if (!(space instanceof Space$)) {
        return null // invalid call.
      }
      // populate operands
      var clist = clause.$
      var offset = typeof that !== 'undefined'
        ? clist[0] === symbolSubject ? 3 : 2
        : clist[0] === symbolPairing ? 2 : 1
      var scope = createOperatorSpace(space, origin)
      for (var i = 0; i < params.length; i++) {
        var j = i + offset
        scope.context[params[i]] = j < clist.length ? clist[j] : null
      }
      scope.prepareOp(clause, offset, that)
      return evaluate(tbody, scope)
    }
  }

  // accepts operand or (operand ...)
  // returns [operand-list, code]
  function formatOperands (params) {
    if (params instanceof Symbol$) {
      return [[params.key], new Tuple$([params])]
    }
    if (!(params instanceof Tuple$) || params.$.length < 1) {
      return [[], $Tuple.empty]
    }
    var operands = []
    var code = []
    params = params.$
    for (var i = 0; i < params.length; i++) {
      var param = params[i]
      if (param instanceof Symbol$) {
        operands.push(param.key)
        code.push(param)
      }
    }
    return operands.length > 0 ? [operands, new Tuple$(code)]
      : [[], $Tuple.empty]
  }
}


/***/ }),

/***/ "./es/runtime/run.js":
/*!***************************!*\
  !*** ./es/runtime/run.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function run ($void) {
  var $ = $void.$
  var compile = $.compile
  var Tuple$ = $void.Tuple
  var warn = $void.$warn
  var $export = $void.export
  var execute = $void.execute
  var completeFile = $void.completeFile
  var atomicArrayOf = $void.atomicArrayOf

  // late binding: transient wrappers
  var isAbsolutePath = function $isAbsolutePath () {
    isAbsolutePath = $void.$path.isAbsolute.bind($void.$path)
    return isAbsolutePath.apply(null, arguments)
  }
  var resolvePath = function $resolvePath () {
    resolvePath = $void.$path.resolve.bind($void.$path)
    return resolvePath.apply(null, arguments)
  }

  // run a module from source as an application.
  $void.$run = $export($void.$app, 'run', function (appUri, args, appHome) {
    if (typeof appUri !== 'string') {
      warn('run', 'invalid app uri type:', typeof appUri, 'of', appUri)
      return null
    }
    // formalize arguments values to separate spaces.
    args = Array.isArray(args) ? atomicArrayOf(args) : []

    // try to resolve the base uri of the whole application
    if (typeof appHome !== 'string' || appHome.length < 1) {
      appHome = $void.$env('home')
    }

    // try to resolve the uri for source
    appUri = completeFile(appUri)
    var uri = isAbsolutePath(appUri) ? appUri : resolvePath(appHome, appUri)
    if (typeof uri !== 'string') {
      warn('run', 'failed to resolve app at', uri)
      return null
    }

    // try to load file
    var doc = $void.loader.load(uri)
    var text = doc[0]
    if (!text) {
      warn('run', 'failed to read source', appUri, 'for', doc[1])
      return null
    }

    var code = compile(text, uri, doc[1])
    if (!(code instanceof Tuple$)) {
      warn('run', 'compiler warnings:', code)
      return null
    }

    try {
      return execute(null, code, uri, args, appHome)[0]
    } catch (signal) {
      warn('run', 'invalid call to', signal.id,
        'in', text, 'from', uri, 'with', args)
      return null
    }
  })
}


/***/ }),

/***/ "./es/runtime/signal-of.js":
/*!*********************************!*\
  !*** ./es/runtime/signal-of.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function signalOfIn ($void) {
  var Signal$ = $void.Signal
  var evaluate = $void.evaluate

  $void.signalOf = function signalOf (type) {
    return function (space, clause) {
      var clist = clause.$
      var length = clist.length
      if (length < 2) {
        throw new Signal$(type, 0, null)
      }
      if (length === 2) {
        throw new Signal$(type, 1, evaluate(clist[1], space))
      }
      var result = []
      var i
      for (i = 1; i < length; i++) {
        result.push(evaluate(clist[i], space))
      }
      throw new Signal$(type, i - 1, result)
    }
  }
}


/***/ }),

/***/ "./es/runtime/signal.js":
/*!******************************!*\
  !*** ./es/runtime/signal.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function signalIn ($void) {
  // the signal object to be used in control flow.
  $void.Signal = function Signal$ (id, count, value) {
    this.id = id
    this.count = count
    this.value = value
  }
}


/***/ }),

/***/ "./es/runtime/space.js":
/*!*****************************!*\
  !*** ./es/runtime/space.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function space ($void) {
  var $ = $void.$
  var $Object = $.object
  var ClassInst$ = $void.ClassInst
  var isObject = $void.isObject
  var indexerOf = $void.indexerOf
  var defineConst = $void.defineConst
  var ownsProperty = $void.ownsProperty

  // late binding: transient wrappers
  var moduleCreate = function $moduleCreate () {
    moduleCreate = $void.module.create.bind($void.module)
    return moduleCreate.apply(null, arguments)
  }
  var dirname = function $dirname () {
    dirname = $void.$path.dirname.bind($void.$path)
    return dirname.apply(null, arguments)
  }
  var isAbsolutePath = function $isAbsolutePath () {
    isAbsolutePath = $void.$path.isAbsolute.bind($void.$path)
    return isAbsolutePath.apply(null, arguments)
  }

  // shared empty array
  var EmptyArray = Object.freeze([])

  var atomOf = $.tuple['atom-of']
  // to be used for safely separating spaces.
  $void.atomicArrayOf = function (src) {
    var values = []
    for (var i = 0; i < src.length; i++) {
      values.push(atomOf(src[i]))
    }
    return values
  }

  $void.Space = Space$
  function Space$ (local, locals, context, export_) {
    this.local = local
    this.context = context || Object.create(local)
    if (locals) {
      this.locals = locals
    }
    if (export_) {
      this.exporting = export_
    }
  }
  Space$.prototype = Object.assign(Object.create(null), {
    resolve: function (key) {
      var value = $[key]
      if (typeof value !== 'undefined') {
        return value
      }
      value = this.context[key]
      if (typeof value !== 'undefined') {
        return value
      }
      var this_ = this.context.this
      return typeof this_ === 'undefined' || this_ === null ? null
        : indexerOf(this_).call(this_, key)
    },
    $resolve: function (key) {
      return typeof $[key] === 'undefined' ? null : $[key]
    },
    var: function (key, value) {
      return (this.local[key] = value)
    },
    const: function (key, value) {
      return defineConst(this.local, key, value)
    },
    lvar: function (key, value) {
      return (this.context[key] = value)
    },
    lconst: function (key, value) {
      return defineConst(this.context, key, value)
    },
    let: function (key, value) {
      if (ownsProperty(this.local, key)) {
        return (this.local[key] = value)
      }
      if (this.locals) {
        for (var i = this.locals.length - 1; i >= 0; i--) {
          if (ownsProperty(this.locals[i], key)) {
            return (this.locals[i][key] = value)
          }
        }
      }
      var this_ = this.context.this
      if (isObject(this_) && (ownsProperty(this_, key) || (
        (this_ instanceof ClassInst$) && key !== 'type' &&
        ownsProperty(this_.type.proto, key)
      ))) {
        // auto field assignment only works for an existing field of an object.
        return indexerOf(this_).call(this_, key, value)
      }
      return (this.local[key] = value)
    },
    export: function (key, value) {
      this.exporting && typeof this.exporting[key] === 'undefined' &&
        (this.exporting[key] = value)
      return this.var(key, value)
    },
    populate: function (ctx) {
      if (Array.isArray(ctx)) {
        this.context.arguments = ctx.length < 1 ? EmptyArray
          : Object.isFrozen(ctx) ? ctx : Object.freeze(ctx)
        return
      }
      if (ctx === null || typeof ctx !== 'object') {
        return
      }

      var keys = Object.getOwnPropertyNames(ctx)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        switch (key) {
          case 'this':
            this.context.this = ctx.this
            break
          case 'arguments':
            if (Array.isArray(ctx.arguments)) {
              this.context.arguments = ctx.arguments.length < 1 ? EmptyArray
                : Object.isFrozen(ctx.arguments) ? ctx.arguments
                  : Object.freeze(ctx.arguments.slice())
            }
            break
          default:
            this.local[key] = ctx[key]
        }
      }
    },
    prepare: function (do_, this_, args) {
      this.context.do = do_
      this.context.this = typeof this_ === 'undefined' ? null : this_
      this.context.arguments = args.length < 1
        ? EmptyArray : Object.freeze(args)
    },
    prepareOp: function (operation, operand, that) {
      this.context.operation = operation
      this.context.operand = operand
      this.context.that = typeof that !== 'undefined' ? that : null
    },
    reserve: function () {
      return this._reserved || (
        this._reserved = {
          local: this.local,
          locals: this.locals,
          app: this.app
        }
      )
    },
    bindOperators: function () {
      // convert operators to internal helper functions
      $void.bindOperatorFetch(this)
      $void.bindOperatorImport(this)
      $void.bindOperatorLoad(this)
    }
  })

  $void.createAppSpace = function (uri, home) {
    var app = Object.create($)
    Object.assign(app, $void.$app)
    app['-app'] = uri
    app['-app-dir'] = dirname(uri)
    app['-app-home'] = home || app['-app-dir']

    var local = Object.create(app)
    local['-module'] = app['-app']
    local['-module-dir'] = app['-app-dir']

    var exporting = Object.create(null)
    var space = new Space$(local, null, null, exporting)
    app.modules = moduleCreate(space)
    space.app = app
    space.export = function (key, value) {
      if (typeof exporting[key] === 'undefined') {
        app[key] = value
        exporting[key] = value
      }
      return space.var(key, value)
    }
    return space
  }

  // a bootstrap app space can be used to fetch app's dependencies.
  $void.createBootstrapSpace = function (appUri) {
    var bootstrap = $void.bootstrap = $void.createAppSpace(appUri)
    bootstrap.bindOperators()
    return bootstrap
  }

  $void.createModuleSpace = function (uri, appSpace) {
    var app = appSpace && appSpace.app
    var local = Object.create(app || $)
    local['-module'] = uri || ''
    local['-module-dir'] = uri && (isAbsolutePath(uri) ? dirname(uri) : '')
    var export_ = Object.create($Object.proto)
    var space = new Space$(local, null, null, export_)
    if (app) {
      space.app = app
    }
    return space
  }

  $void.createLambdaSpace = function (app, modules, module_) {
    var space
    if (app) {
      space = new Space$(Object.create(app))
      space.app = app
    } else {
      space = new Space$(Object.create($))
    }
    if (module_) {
      space.local['-module'] = module_ || ''
      space.local['-module-dir'] = module_ ? dirname(module_) : ''
    }
    return space
  }

  $void.createFunctionSpace = function (parent) {
    var space = new Space$(Object.create(parent.local),
      parent.locals ? parent.locals.concat(parent.local) : [parent.local]
    )
    if (parent.app) {
      space.app = parent.app
    }
    return space
  }

  // customized the behavior of the space of an operator
  $void.OperatorSpace = OperatorSpace$
  function OperatorSpace$ (parent, origin) {
    // the original context is preferred over global.
    this.$ = origin
    // operator context is accessible to the context of calling function.
    this.context = Object.create(parent.context)
    // use the same local of calling function.
    this.local = parent.local
    if (parent.locals) {
      this.locals = parent.locals
    }
    // reserve app
    if (parent.app) {
      this.app = parent.app
    }
  }
  OperatorSpace$.prototype = Object.assign(Object.create(Space$.prototype), {
    inop: true, // indicates this is an operator space.
    $resolve: function (key) {
      // global entities are not overridable
      return typeof $[key] !== 'undefined' ? $[key]
        : typeof this.$[key] === 'undefined' ? null : this.$[key]
    }
  })

  $void.createOperatorSpace = function (parent, origin) {
    return new OperatorSpace$(parent, origin)
  }
}


/***/ }),

/***/ "./es/start.js":
/*!*********************!*\
  !*** ./es/start.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function initializeSpace ($void) {
  __webpack_require__(/*! ./generic/void */ "./es/generic/void.js")($void)
  __webpack_require__(/*! ./generic/encoding */ "./es/generic/encoding.js")($void)

  __webpack_require__(/*! ./generic/null */ "./es/generic/null.js")($void)
  __webpack_require__(/*! ./generic/type */ "./es/generic/type.js")($void)

  __webpack_require__(/*! ./generic/bool */ "./es/generic/bool.js")($void)
  __webpack_require__(/*! ./generic/string */ "./es/generic/string.js")($void)
  __webpack_require__(/*! ./generic/number */ "./es/generic/number.js")($void)
  __webpack_require__(/*! ./generic/date */ "./es/generic/date.js")($void)
  __webpack_require__(/*! ./generic/range */ "./es/generic/range.js")($void)

  __webpack_require__(/*! ./generic/symbol */ "./es/generic/symbol.js")($void)
  __webpack_require__(/*! ./generic/tuple */ "./es/generic/tuple.js")($void)

  __webpack_require__(/*! ./generic/operator */ "./es/generic/operator.js")($void)
  __webpack_require__(/*! ./generic/lambda */ "./es/generic/lambda.js")($void)
  __webpack_require__(/*! ./generic/function */ "./es/generic/function.js")($void)

  __webpack_require__(/*! ./generic/iterator */ "./es/generic/iterator.js")($void)
  __webpack_require__(/*! ./generic/promise */ "./es/generic/promise.js")($void)

  __webpack_require__(/*! ./generic/array */ "./es/generic/array.js")($void)
  __webpack_require__(/*! ./generic/object */ "./es/generic/object.js")($void)
  __webpack_require__(/*! ./generic/set */ "./es/generic/set.js")($void)
  __webpack_require__(/*! ./generic/map */ "./es/generic/map.js")($void)

  __webpack_require__(/*! ./generic/class */ "./es/generic/class.js")($void)

  __webpack_require__(/*! ./generic/global */ "./es/generic/global.js")($void)
}

function initializeLib ($void, stdout) {
  __webpack_require__(/*! ./lib/stdout */ "./es/lib/stdout.js")($void, stdout)
  __webpack_require__(/*! ./lib/format */ "./es/lib/format.js")($void)
  __webpack_require__(/*! ./lib/math */ "./es/lib/math.js")($void)
  __webpack_require__(/*! ./lib/uri */ "./es/lib/uri.js")($void)
  __webpack_require__(/*! ./lib/json */ "./es/lib/json.js")($void)
  __webpack_require__(/*! ./lib/emitter */ "./es/lib/emitter.js")($void)
  __webpack_require__(/*! ./lib/timer */ "./es/lib/timer.js")($void)
  __webpack_require__(/*! ./lib/espress */ "./es/lib/espress.js")($void)
}

function initializeRuntime ($void) {
  __webpack_require__(/*! ./runtime/env */ "./es/runtime/env.js")($void)
  __webpack_require__(/*! ./runtime/signal */ "./es/runtime/signal.js")($void)
  __webpack_require__(/*! ./runtime/space */ "./es/runtime/space.js")($void)
  __webpack_require__(/*! ./runtime/evaluate */ "./es/runtime/evaluate.js")($void)
  __webpack_require__(/*! ./runtime/signal-of */ "./es/runtime/signal-of.js")($void)
  __webpack_require__(/*! ./runtime/function */ "./es/runtime/function.js")($void)
  __webpack_require__(/*! ./runtime/operator */ "./es/runtime/operator.js")($void)

  __webpack_require__(/*! ./runtime/execute */ "./es/runtime/execute.js")($void)
  __webpack_require__(/*! ./runtime/eval */ "./es/runtime/eval.js")($void)
  __webpack_require__(/*! ./runtime/run */ "./es/runtime/run.js")($void)
}

function initializeOperators ($void) {
  __webpack_require__(/*! ./operators/pattern */ "./es/operators/pattern.js")($void)
  __webpack_require__(/*! ./operators/quote */ "./es/operators/quote.js")($void)

  __webpack_require__(/*! ./operators/assignment */ "./es/operators/assignment.js")($void)
  __webpack_require__(/*! ./operators/control */ "./es/operators/control.js")($void)

  __webpack_require__(/*! ./operators/general */ "./es/operators/general.js")($void)
  __webpack_require__(/*! ./operators/logical */ "./es/operators/logical.js")($void)
  __webpack_require__(/*! ./operators/bitwise */ "./es/operators/bitwise.js")($void)
  __webpack_require__(/*! ./operators/arithmetic */ "./es/operators/arithmetic.js")($void)

  __webpack_require__(/*! ./operators/literal */ "./es/operators/literal.js")($void)
  __webpack_require__(/*! ./operators/function */ "./es/operators/function.js")($void)
  __webpack_require__(/*! ./operators/operator */ "./es/operators/operator.js")($void)

  __webpack_require__(/*! ./operators/import */ "./es/operators/import.js")($void)
  __webpack_require__(/*! ./operators/load */ "./es/operators/load.js")($void)
  __webpack_require__(/*! ./operators/fetch */ "./es/operators/fetch.js")($void)

  __webpack_require__(/*! ./operators/generator */ "./es/operators/generator.js")($void)
}

function initializeSharedSymbols ($void) {
  var sharedSymbolOf = $void.sharedSymbolOf
  var key
  for (key in $void.$) {
    sharedSymbolOf(key)
  }
  for (key in $void.$app) {
    sharedSymbolOf(key)
  }
  $void.operatorSymbols = new Set(
    Object.keys($void.staticOperators).map(key =>
      sharedSymbolOf(key)
    )
  )
}

module.exports = function start (stdout) {
  // Hello, world.
  var $void = __webpack_require__(/*! ./generic/genesis */ "./es/generic/genesis.js")()

  // create generic type system
  initializeSpace($void)

  // prepare primary lib
  initializeLib($void, stdout($void))

  // prepare tokenizer & compiler
  __webpack_require__(/*! ./tokenizer */ "./es/tokenizer.js")($void)
  __webpack_require__(/*! ./compiler */ "./es/compiler.js")($void)

  // assemble runtime functions
  initializeRuntime($void)

  // assemble & publish operators
  initializeOperators($void)

  // cache symbols for all global entities.
  initializeSharedSymbols($void)

  return $void
}


/***/ }),

/***/ "./es/tokenizer.js":
/*!*************************!*\
  !*** ./es/tokenizer.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function tokenizerIn ($void) {
  var $ = $void.$
  var symbolOf = $.symbol.of
  var intValueOf = $.number['parse-int']
  var strUnescape = $.string.unescape
  var warn = $void.$warn
  var $export = $void.export
  var isApplicable = $void.isApplicable

  var Constants = $void.constantValues
  var RegexDecimal = $void.regexDecimal
  var RegexSpecialSymbol = $void.regexSpecialSymbol

  var tokenizer = $export($, 'tokenizer', function (parse, srcUri) {
    if (!isApplicable(parse)) {
      return $.tokenize
    }

    var srcText = ''
    if (!srcUri || typeof srcUri !== 'string') {
      srcUri = ''
    }

    var lineNo, lineOffset, lastChar, spacing, indenting, clauseIndent
    var waiter, pendingText, pendingLine, pendingOffset, pendingIndent
    var escaping, stringPadding
    resumeParsing() // initialize context

    function resumeParsing () {
      // general states
      lineNo = 0
      lineOffset = 0
      lastChar = null
      spacing = false
      indenting = 0
      clauseIndent = 0
      // escaping states
      waiter = null
      pendingText = ''
      pendingLine = 0
      pendingOffset = 0
      pendingIndent = -1
      escaping = false
      stringPadding = -1
    }

    var singleQuoteWaiter = createStringWaiter("'", 'format')
    var doubleQuoteWaiter = createStringWaiter('"')

    return function tokenizing (text) {
      if (typeof text !== 'string') {
        srcText = ''
        waiter && waiter() // finalize pending action
        resumeParsing() // clear parsing context
        return false // indicate a reset happened.
      }
      srcText = text
      // start parsing
      for (var i = 0; i < text.length; i++) {
        var c = text[i]
        if (!waiter || !waiter(c)) {
          processChar(c)
        }
        finalizeChar(c)
      }
      return true // keep waiting more code
    }

    function processChar (c) {
      switch (c) {
        case '(':
          parse('punctuation', c, [clauseIndent, lineNo, lineOffset])
          clauseIndent = -1 // clear beginning indent
          break
        case ')':
          parse('punctuation', c, [indenting, lineNo, lineOffset])
          break
        case '\\': // force to start a symbol.
          escaping = true
          beginSymbol('')
          break
        case '`':
        case '@':
        case ':':
        case '$':
        case ',': // logical separator
        case ';': // line-closing
        case '[': // reserved as annotation block beginning.
        case ']': // reserved as annotation block.
        case '{': // reserved as block punctuation
        case '}': // reserved as block punctuation
          parse('symbol', symbolOf(c), [indenting, lineNo, lineOffset])
          break
        case "'":
          // always use double quote internally.
          beginWaiting('"', singleQuoteWaiter)
          break
        case '"':
          beginWaiting('"', doubleQuoteWaiter)
          break
        case '#':
          beginWaiting('', commentWaiter)
          break
        case ' ':
        case '\t': // It may spoil well formatted code.
          processWhitespace(c)
          break
        default:
          beginSymbol(c)
          break
      }
    }

    function finalizeChar (c) {
      lastChar = c
      spacing = !waiter && /[\s]/.test(c)
      if (c !== ' ' && c !== '\t') {
        indenting = -1
      }
      if (c === '\n') {
        lineNo += 1
        lineOffset = indenting = clauseIndent = 0
      } else {
        lineOffset += 1
      }
    }

    function beginWaiting (c, stateWaiter) {
      waiter = stateWaiter
      pendingText = c
      pendingLine = lineNo
      pendingOffset = lineOffset
      pendingIndent = indenting
    }

    function processWhitespace (c) {
      if (indenting < 0) {
        return raiseSpace(c)
      }
      if (c === '\t') {
        warn('tokenizer', 'TAB-space is not suggested in indention.',
          [srcUri || srcText, lineNo, lineOffset, indenting])
      }
      clauseIndent = ++indenting
    }

    function createStringWaiter (quote, tokenType) {
      function raiseValue () {
        parse(tokenType || 'value', strUnescape(pendingText + '"'),
          [pendingIndent, pendingLine, pendingOffset, lineNo, lineOffset])
        waiter = null
        return true
      }

      return function (c) {
        if (typeof c === 'undefined') { // unexpected ending
          warn('tokenizer', 'a string value is not properly closed.',
            [srcUri || srcText, lineNo, lineOffset, pendingLine, pendingOffset])
          return raiseValue()
        }
        if (c === '\r') { // skip '\r' anyway
          return true
        }
        if (c === '\n') { // multiline string.
          if (escaping) { // trailing escaping char indicates to keep the '\n'
            pendingText += 'n'
            stringPadding = 1 // use the new-line as space padding.
            escaping = false
          } else if (stringPadding < 0) {
            stringPadding = 0 // turn on space padding
          }
          return true
        }
        if (/[\s]/.test(c)) {
          if (stringPadding >= 0) { // padding or padded
            if (stringPadding === 0) { // padding
              if (pendingText.length > 1) { // avoid a leading whitespace
                pendingText += ' ' // keeps the first space character.
              }
              stringPadding = 1
            }
            return true
          }
          // fallback to common string logic
        } else {
          stringPadding = -1 // turn off string padding
        }
        if (escaping) { // common escaping
          pendingText += c
          escaping = false
          return true
        }
        if (c === quote) {
          return raiseValue()
        }
        pendingText += quote === "'" && c === '"' ? '\\' + c : c
        if (c === '\\') {
          escaping = true
        }
        return true
      }
    }

    function raiseSpace (c) {
      if (!spacing || c === '\n') { // only raise once for common spaces, but
        // raise every new-line in case parser giving it special meanings.
        parse('space', c, [indenting, lineNo, lineOffset])
      }
    }

    function commentWaiter (c) {
      if (typeof c === 'undefined' || c === '\n') {
        parse('comment', pendingText,
          [pendingIndent, pendingLine, pendingOffset, lineNo, lineOffset])
        waiter = null
      } else if (pendingText.length < 1 && c === '(') {
        pendingText = '('
        waiter = blockCommentWaiter // upgrade to block comment
      } else {
        pendingText += c
      }
      return c !== '\n'
    }

    function blockCommentWaiter (c) {
      if (c) {
        if (lastChar !== ')' || c !== '#') {
          pendingText += c
          return true
        } // else, normal ending
      } else {
        pendingText += ')'
        warn('tokenizer', 'a block comment is not properly closed.',
          [srcUri || srcText, lineNo, lineOffset, pendingLine, pendingOffset])
      }
      parse('comment', pendingText,
        [pendingIndent, pendingLine, pendingOffset, lineNo, lineOffset])
      waiter = null
      return true
    }

    function beginSymbol (c) {
      /[\s]/.test(c) ? raiseSpace(c) // report space once.
        : beginWaiting(c, symbolWaiter)
    }

    function symbolWaiter (c) {
      if (c && escaping) {
        pendingText += c
        escaping = false
        return true
      }
      if (c === '\\') {
        escaping = true
        return true
      }
      if (c && !RegexSpecialSymbol.test(c)) {
        pendingText += c
        return true
      }
      raiseSymbol()
      escaping = false
      waiter = null
      return false // return the char to tokenizer.
    }

    function raiseSymbol () {
      var type, value
      if (typeof Constants[pendingText] !== 'undefined') { // a constant value
        value = Constants[pendingText]
      } else if (RegexDecimal.test(pendingText)) { // a decimal number
        value = /(\.|e|E|^-0$)/.test(pendingText)
          ? parseFloat(pendingText) : intValueOf(pendingText)
      } else if (pendingText.startsWith('0')) { // a special integer number
        value = intValueOf(pendingText)
      } else { // a common symbol
        type = 'symbol'
        value = symbolOf(pendingText)
      }
      parse(type || 'value', value,
        [pendingIndent, pendingLine, pendingOffset, lineNo, lineOffset - 1])
    }
  })

  // a helper function to tokenize a piece of text.
  $export($, 'tokenize', function (text) {
    var tokens = []
    var tokenizing = tokenizer(function collector () {
      tokens.push(Array.prototype.slice.call(arguments))
    })
    tokenizing(text)
    tokenizing() // notify the end of stream.
    return tokens
  })
}


/***/ }),

/***/ "./lib/interpreter.js":
/*!****************************!*\
  !*** ./lib/interpreter.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function interpreterIn ($void) {
  var $ = $void.$
  var compiler = $.compiler
  var Signal$ = $void.Signal
  var evaluate = $void.evaluate
  var isApplicable = $void.isApplicable
  var createAppSpace = $void.createAppSpace

  // late binding: transient wrappers
  var joinPath = function $joinPath () {
    joinPath = $void.$path.join.bind($void.$path)
    return joinPath.apply(null, arguments)
  }

  // interactively feed & evaluate
  return function interpreter (context, shell) {
    if (!isApplicable(shell)) {
      return null
    }
    // create a module space.
    var appUri = joinPath($void.$env('runtime-home'), '@')
    var scope = createAppSpace(appUri, $void.$env('home'))
    scope.populate(context)
    // create compiler.
    var compile = compiler(function (expr, status) {
      if (status) {
        shell.apply(null, [null, 'compiler:' + status].concat(
          Array.prototype.slice.call(arguments, 2)))
        return
      }
      var value = expr[0]
      var src = expr[1]
      try {
        shell(evaluate(value, scope))
      } catch (signal) {
        if (signal instanceof Signal$) {
          if (signal.id === 'return') {
            shell(signal.value)
          } else if (signal.id === 'exit') {
            shell(signal.value, 'exiting')
          } else {
            shell(null, 'warning', 'invalid call to ' + signal.id, [value, src])
          }
        } else {
          shell(null, 'warning', 'unexpected error in evaluation', [signal, value, src])
        }
      }
    })

    return function interpret (text) {
      if (typeof text === 'string') {
        return compile(text) // push input into compiler
      } else {
        return compile() // reset status.
      }
    }
  }
}


/***/ }),

/***/ "./lib/loader/cache.js":
/*!*****************************!*\
  !*** ./lib/loader/cache.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var KeyPrefix = '/es/loaded:'
var KeyVersion = KeyPrefix + 'version:'

function createStore (localStorage) {
  function enumKeys () {
    var keys = []
    for (var i = 0, len = localStorage.length; i < len; i++) {
      var key = localStorage.key(i)
      if (key.startsWith(KeyPrefix)) {
        keys.push(localStorage.key(i))
      }
    }
    return keys
  }

  return {
    keys: enumKeys,
    getItem: localStorage.getItem.bind(localStorage),
    setItem: localStorage.setItem.bind(localStorage),
    removeItem: localStorage.removeItem.bind(localStorage),
    clear: function () {
      var keys = enumKeys()
      for (var i = 0, len = keys.length; i < len; i++) {
        localStorage.removeItem(keys[i])
      }
      return keys
    }
  }
}

function useMemory () {
  var store = Object.create(null)

  return {
    keys: function () {
      return Object.getOwnPropertyNames(store)
    },
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      store[key] = value
    },
    removeItem: function (key) {
      delete store[key]
    },
    clear: function () {
      store = Object.create(null)
    }
  }
}

function keyOf (uri) {
  return typeof uri === 'string' && uri ? KeyPrefix + uri : null
}

function versionKeyOf (uri) {
  return typeof uri === 'string' && uri ? KeyVersion + uri : null
}

function generateTimestamp (version) {
  return 'local:' + Math.trunc(Date.now() / 600 / 1000)
}

function manage (store) {
  var management = Object.create(null)

  management.list = function list (filter) {
    var uris = []
    var keys = store.keys()
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith(KeyVersion)) {
        if (typeof filter !== 'string' || keys[i].indexOf(filter) > 0) {
          uris.push([keys[i].substring(KeyVersion.length), store.getItem(keys[i])])
        }
      }
    }
    return uris
  }
  management.read = function read (uri) {
    var keys = store.keys()
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith(KeyVersion)) {
        if (typeof uri !== 'string' || keys[i].indexOf(uri) > 0) {
          return store.getItem(keyOf(keys[i].substring(KeyVersion.length)))
        }
      }
    }
  }
  management.reset = function reset (filter) {
    var counter = 0
    var keys = store.keys()
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith(KeyVersion)) {
        if (typeof filter !== 'string' || keys[i].indexOf(filter) > 0) {
          counter++
          store.removeItem(keys[i])
          store.removeItem(keyOf(keys[i].substring(KeyVersion.length)))
        }
      }
    }
    return counter
  }
  management.clear = function clear () {
    store.clear()
    return true
  }
  return management
}

module.exports = function cacheIn ($void) {
  var store = $void.isNativeHost ? useMemory()
    : createStore(window.localStorage)

  var cache = Object.create(null)
  cache.store = manage(store)

  cache.get = function get (uri) {
    var key = keyOf(uri)
    return key ? store.getItem(key) : null
  }
  cache.ver = function ver (uri) {
    var key = versionKeyOf(uri)
    return key ? store.getItem(key) : null
  }
  cache.isTimestamp = function isTimestamp (version) {
    return version.startsWith('local:')
  }
  cache.isExpired = function isExpired (version) {
    return version !== generateTimestamp()
  }
  cache.set = function set (uri, value, version) {
    if (typeof value !== 'string') {
      return null // invalid call.
    }
    var key = keyOf(uri)
    var verKey = versionKeyOf(uri)
    if (!key || !verKey) {
      return null // invalid call.
    }
    if (typeof version !== 'string' || !key) {
      version = generateTimestamp()
    }
    store.setItem(key, value)
    store.setItem(verKey, version)
    return version
  }

  return cache
}


/***/ }),

/***/ "./lib/loader/http.js":
/*!****************************!*\
  !*** ./lib/loader/http.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var axios = __webpack_require__(/*! axios */ "./node_modules/axios/index.js")

function allowNotModified (status) {
  return (status >= 200 && status < 300) || status === 304
}

function notCached (url, dirs) {
  return [404, 'Not Cached', dirs ? [url, dirs] : [url]]
}

function responseError (url, response) {
  return [response.status, response.statusText, [url]]
}

function responseUnavailable (url, error) {
  return [503, 'Response Unavailable', [url, error]]
}

module.exports = function httpIn ($void) {
  var $ = $void.$
  var $Promise = $.promise
  var promiseOfResolved = $Promise['of-resolved']

  var loader = Object.create(null)
  var cache = loader.cache = __webpack_require__(/*! ./cache */ "./lib/loader/cache.js")($void)

  var proxy = axios.create({
    timeout: 30000,
    transformResponse: undefined,
    responseType: 'text',
    keepAlive: 'timeout=10, max=1000'
  })

  function generateConfig (version) {
    return !version || cache.isTimestamp(version) ? null : {
      validateStatus: allowNotModified,
      headers: {
        'If-None-Match': version
      }
    }
  }

  loader.isRemote = function isRemote (url) {
    return /^(http[s]?:\/\/)/i.test(url)
  }

  loader.load = function load (url) {
    var data = cache.get(url)
    return data ? [data, cache.ver(url)] : [null, notCached(url)]
  }

  loader.fetch = function fetch (url) {
    var version = cache.ver(url)
    return !cache.isExpired(version) ? promiseOfResolved(url)
      : $Promise.of(function (async) {
        proxy.get(url,
          generateConfig(version)
        ).then(function (response) {
          if (response.status !== 304) {
            cache.set(url, response.data, response.headers['etag'])
          }
          async.resolve(url)
        }).catch(function (error) {
          async.reject(error.response
            ? responseError(url, error.response)
            : responseUnavailable(url, error)
          )
        })
      })
  }

  return loader
}


/***/ }),

/***/ "./lib/module.js":
/*!***********************!*\
  !*** ./lib/module.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var LocalRef = /^[.{1,2}$|.{0,2}/]/

module.exports = function moduleIn ($void) {
  var warn = $void.$warn
  var completeFile = $void.completeFile
  var runtimeHome = $void.$env('runtime-home')

  var $package = __webpack_require__(/*! ./package */ "./lib/package.js")($void)

  var $module = Object.create(null)

  $module.create = function create (appSpace) {
    var $path = $void.$path
    var appDir = appSpace.local['-app-dir']

    var packages = $package.create(appSpace)

    var modules = Object.create(null)
    var cache = modules.cache = Object.create(null)

    modules.resolve = function resolve (targetModule, srcModuleDir) {
      if ($path.isAbsolute(targetModule)) {
        return completeFile($path.normalize(targetModule))
      }

      var pkg, mod
      var offset = targetModule.indexOf('/')
      if (offset >= 0) {
        pkg = targetModule.substring(0, offset++)
        mod = targetModule.substring(offset)
      } else {
        pkg = targetModule
      }
      var pkgRoot = !LocalRef.test(pkg)
        ? pkg === 'es' // runtime modules
          ? $path.resolve(runtimeHome, 'modules')
          : packages.lookup(srcModuleDir, pkg)
        : pkg.startsWith('//')
          ? $path.resolve(appDir, pkg.substring(2)) // from app root
          : pkg.startsWith('/')
            ? $path.resolve(pkg) // from fs root or origin
            : $path.resolve(srcModuleDir, pkg) // relative path

      return $path.resolve(pkgRoot, completeFile(mod))
    }

    modules.lookupInCache = function lookupInCache (uri, moduleUri) {
      var module_ = cache[uri] || (cache[uri] = {
        status: 0, // an empty module.
        props: {
          '-module': uri
        }
      })
      if (module_.status === 100) {
        warn('import', 'loop dependency on', module_.props, 'from', moduleUri)
        return module_
      }
      if (module_.status !== 200) {
        module_.status = 0 // reset statue to re-import.
        module_.props['-imported-by'] = moduleUri
        module_.props['-imported-at'] = Date.now()
      }
      return module_
    }

    return modules
  }

  return $module
}


/***/ }),

/***/ "./lib/modules/symbols.js":
/*!********************************!*\
  !*** ./lib/modules/symbols.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

module.exports = function $symbols ($void) {
  var symbols = Object.create(null)
  var os = $void.isNativeHost ? process.platform : 'browser'

  if (os === 'win32') {
    symbols.passed = '\u221a '
    symbols.failed = '\u00d7 '
    symbols.pending = '~ '
  } else if (os === 'darwin' || os === 'browser') {
    symbols.passed = '✓ '
    symbols.failed = '✘ '
    symbols.pending = '\u22EF '
  } else { // *nix without X.
    symbols.passed = '= '
    symbols.failed = 'x '
    symbols.pending = '~ '
  }

  return symbols
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./lib/package.js":
/*!************************!*\
  !*** ./lib/package.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function packageIn ($void) {
  var $ = $void.$
  var $debug = $void.$debug
  var loader = $void.loader

  var $package = Object.create(null)

  $package.create = function create (appSpace) {
    var $path = $void.$path
    var appHome = appSpace.local['-app-home']

    var packages = Object.create(null)
    var dependency = initDependency()
    var installation = initInstallation()

    function initDependency () {
      var path = $path.join(appHome, '@dependency.es')
      var data = loader.load(path)
      var obj = data ? $.eval(data) : Object.create(null)
      if (typeof obj.references !== 'object' || obj.references === null) {
        obj.references = Object.create(null)
      }
      if (typeof obj.packages !== 'object' || obj.packages === null) {
        obj.packages = Object.create(null)
      }
      return obj
    }

    function initInstallation () {
      var path = $path.join(appHome, '@installation.es')
      var data = loader.load(path)
      return data ? $.eval(data) : Object.create(null)
    }

    function findSourcePackage (srcModule) {
      for (var uri in Object.keys(installation)) {
        var path = installation[uri]
        if (srcModule.startsWith(path)) {
          return uri
        }
      }
      return null
    }

    function findTargetPackage (srcPackageUri, refName) {
      var pkgDependency = srcPackageUri ? dependency.packages[srcPackageUri] : null
      return (pkgDependency && pkgDependency[srcPackageUri]) ||
        dependency.references[refName]
    }

    function findPackageRoot (targetPackageUri) {
      return targetPackageUri && installation[targetPackageUri]
    }

    packages.lookup = function lookup (srcModule, refName) {
      var srcPackageUri = findSourcePackage(srcModule)
      $debug(srcModule, 'belongs to package', srcPackageUri)

      var targetPackageUri = findTargetPackage(srcPackageUri, refName)
      $debug(refName, 'is resolved to', targetPackageUri)

      var packageRoot = findPackageRoot(targetPackageUri) || ('packages/' + refName)
      $debug(refName, 'is installed at', packageRoot)
      return $path.resolve(appHome, packageRoot)
    }
    return packages
  }

  return $package
}


/***/ }),

/***/ "./lib/shell.js":
/*!**********************!*\
  !*** ./lib/shell.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function shellIn ($void) {
  var $ = $void.$
  var typeOf = $.type.of
  var warn = $void.$warn
  var print = $void.$print
  var printf = $void.$printf
  var isTruthy = $void.isTruthy
  var thisCall = $void.thisCall
  var safelyAssign = $void.safelyAssign

  var context = Object.create(null)
  var interpreter = __webpack_require__(/*! ./interpreter */ "./lib/interpreter.js")($void)

  context['test-bootstrap'] = __webpack_require__(/*! ../test/test */ "./test/test.js")($void)
  context['.loader'] = safelyAssign(Object.create(null), $void.loader.cache.store)

  return function shell (stdin, exit) {
    var echo = typeof stdin.echo === 'function'
      ? stdin.echo.bind(stdin)
      : print.bind(null, '=')

    // create the interpreter
    function typeInfoOf (prefix, value) {
      var info = '#(' + prefix + thisCall(typeOf(value), 'to-string')
      var name = !value ? ''
        : typeof value.name === 'string' ? value.name
          : ''
      return name ? info + ': ' + name + ')# ' : info + ')# '
    }

    function format (value, prefix) {
      return typeInfoOf(prefix || '', value) + thisCall(value, 'to-string')
    }

    function resolve (value) {
      if (!(value instanceof Promise)) {
        return echo(format(value))
      }
      echo('#(promise: waiting ...)#')
      value.then(function (result) {
        echo(format(result, '... result: '))
      }, function (err) {
        echo(format(err, '... excuse: '))
      })
    }

    function exiting (code) {
      if (typeof code === 'undefined' || code === null) {
        code = 0
      } else {
        if (echoing) {
          echo(format(code))
        }
        code = typeof code === 'number' ? code >> 0 : 1
      }

      code ? printf('Good luck.\n', 'red')
        : printf('See you again.\n', 'green')

      stdin.close()
      return exit(code)
    }

    function explain (status, value) {
      status === 'exiting' ? echo(exiting(value))
        : warn.apply(null, Array.prototype.slice.call(arguments, 1))
    }

    //  toggle on/of the printing of evaluation result.
    var echoing = false
    context['.echo'] = function echo () {
      echoing = !echoing
      if (echoing) {
        return true
      }
      printf('  ') // this is only visible on console.
      return printf('#(bool)# false\n', 'gray')
    }
    //  display, enable or disable debug output.
    context['.debug'] = function debug (enabled) {
      var isDebugging = $void.$env('is-debugging')
      return typeof enabled === 'undefined' ? isDebugging
        : $void.env('is-debugging', isTruthy(enabled))
    }
    //  display or update logging level.
    context['.logging'] = function logging (level) {
      var loggingLevel = $void.$env('logging-level')
      return typeof level !== 'number' ? loggingLevel
        : $void.env('logging-level', (level >>= 0) < 0 ? 0
          : level > 127 ? 127 : level
        )
    }

    var interpret = interpreter(context, function (value, status) {
      if (status) {
        explain(status, value)
      } else if (echoing) {
        resolve(value)
      }
    })

    // initialize shell environment
    interpret('(var path (import ("$eslang/path").\n')
    interpret('(var * (load (path resolve (env "runtime-home"), "profile").\n')
    echoing = true

    // waiting for input
    stdin.prompt()
    stdin.on('line', function (input) {
      interpret(input)
      var depth = interpret('\n')
      stdin.prompt(depth > 1 ? '..' : '> ')
    })
  }
}


/***/ }),

/***/ "./lib/stdout.js":
/*!***********************!*\
  !*** ./lib/stdout.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var style = __webpack_require__(/*! ./style */ "./lib/style.js")
var styles = style.styles

function bindToConsole (method, prompt) {
  return console[method].bind(console, prompt)
}

module.exports = function stdoutIn ($void) {
  var $ = $void.$
  var stringOf = $.string.of
  var isNativeHost = $void.isNativeHost

  function formatArgs () {
    var strings = []
    for (var i = 0; i < arguments.length; i++) {
      strings.push(stringOf(arguments[i]))
    }
    return strings.join(' ')
  }

  var write = function (text) {
    process.stdout.write(text)
    return text
  }

  function bindTo (method, type, color) {
    var log = isNativeHost
      ? bindToConsole(method, styles.gray('#' + type))
      : bindToConsole(method, '#')

    return isNativeHost ? function () {
      var text = formatArgs.apply(null, arguments)
      log(color ? color(text) : text)
      return text
    } : function () {
      log.apply(null, arguments)
      return formatArgs.apply(null, arguments)
    }
  }

  // default native output methods
  var stdout = Object.create(null)

  // by default, write logs to js console even in tracing mode (web browser).
  stdout.debug = bindTo('debug', 'D', styles && styles.blue)
  stdout.verbose = bindTo('info', 'V', styles && styles.gray)
  stdout.info = bindTo('info', 'I', styles && styles.gray)
  stdout.warn = bindTo('warn', 'W', styles && styles.yellow)
  stdout.error = bindTo('error', 'E', styles && styles.red)

  stdout.print = function print () {
    var text = formatArgs.apply(null, arguments)
    isNativeHost && console.log(text)
    return text
  }

  stdout.printf = function (value, format) {
    var text = formatArgs(value)
    if (isNativeHost) {
      write(style.apply(text, style.parse(format)))
    }
    return text
  }

  return stdout
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./lib/style.js":
/*!**********************!*\
  !*** ./lib/style.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This module is refactored & simplified from code in project
 * [colors](https://github.com/Marak/colors.js).
 */


var style = Object.create(null)

var codes = {
  black: [30, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],

  bold: [1, 22],
  italic: [3, 23],

  overline: null,
  underline: [4, 24],
  'line-through': [9, 29]
}

function stylize (code, str) {
  return '\u001b[' + code[0] + 'm' + str + '\u001b[' + code[1] + 'm'
}

var styles = style.styles = Object.create(null)
Object.keys(codes).forEach(function (key) {
  if (codes[key]) {
    styles[key] = stylize.bind(styles, codes[key])
  }
})

var classes = style.classes = Object.assign(Object.create(null), {
  black: 'color',
  white: 'color',
  grey: 'color',
  gray: 'color',

  red: 'color',
  green: 'color',
  yellow: 'color',
  blue: 'color',

  bold: 'font-weight',
  italic: 'font-style',

  overline: 'text-decoration',
  underline: 'text-decoration',
  'line-through': 'text-decoration'
})

var allowMultiple = style.allowMultiple = new Set([
  'text-decoration'
])

function parseList (values) {
  var props = Object.create(null)
  var enabled = false
  for (var i = 0; i < values.length; i++) {
    var value = values[i]
    if (typeof value !== 'string' || !classes[value]) {
      continue
    }
    enabled = true
    var key = classes[value]
    if (allowMultiple.has(key)) {
      props[key] ? props[key].add(value) : (props[key] = new Set([value]))
    } else {
      props[key] = value
    }
  }
  return enabled && props
}

function parseObject (obj) {
  var props = Object.create(null)
  var enabled = false
  for (var key in obj) {
    var value = obj[key]
    if (typeof value !== 'string') {
      continue
    }
    value = allowMultiple.has(key) ? value.split(/\s/) : [value]
    value.forEach(function (value) {
      if (classes[value] !== key) {
        return
      }
      enabled = true
      if (allowMultiple.has(key)) {
        props[key] ? props[key].add(value) : (props[key] = new Set([value]))
      } else {
        props[key] = value
      }
    })
  }
  return enabled && props
}

style.parse = function parse (format) {
  if (Array.isArray(format)) {
    return parseList(format)
  }
  if (typeof format === 'string') {
    return parseList(format.split(/\s/))
  }
  if (format && typeof format === 'object') {
    return parseObject(format)
  }
  return false
}

style.apply = function apply (text, props) {
  if (props) {
    for (var key in props) {
      var value = props[key]
      if (typeof value === 'string') {
        text = styles[value](text)
      } else { // set
        Array.from(value).forEach(function (value) {
          text = styles[value] && styles[value](text)
        })
      }
    }
  }
  return text
}

module.exports = style


/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, author, license, repository, description, keywords, main, scripts, bin, dependencies, devDependencies, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"eslang\",\"version\":\"1.0.21\",\"author\":{\"email\":\"leevi@nirlstudio.com\",\"name\":\"Leevi Li\"},\"license\":\"MIT\",\"repository\":\"nirlstudio/eslang\",\"description\":\"A simple & expressive script language, like Espresso.\",\"keywords\":[\"es\",\"eslang\",\"espresso\",\"espressolang\",\"espresso-lang\",\"s-expression\",\"script language\",\"programming lang\",\"programming language\"],\"main\":\"index.js\",\"scripts\":{\"test\":\"node . selftest\",\"check\":\"node test/test.js\",\"build\":\"webpack\",\"rebuild\":\"rm -rf dist/www; rm dist/*; rm dist/.cache*; webpack\",\"build-dev\":\"webpack\",\"build-prod\":\"webpack --mode=production\",\"clean\":\"rm -rf dist/www; rm dist/*; rm dist/.cache*\",\"start\":\"webpack serve --mode development\",\"prod\":\"webpack serve --mode production\"},\"bin\":{\"es\":\"bin/es\",\"eslang\":\"bin/eslang\"},\"dependencies\":{\"axios\":\"^0.21.1\"},\"devDependencies\":{\"hooks-webpack-plugin\":\"^1.0.3\",\"html-webpack-plugin\":\"^4.5.1\",\"shelljs\":\"^0.8.4\",\"webpack\":\"^4.46.0\",\"webpack-cli\":\"^4.3.1\",\"webpack-dev-server\":\"^3.11.2\"}}");

/***/ }),

/***/ "./test/test.js":
/*!**********************!*\
  !*** ./test/test.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

module.exports = function testIn ($void) {
  var $ = $void.$
  var print = $void.$print
  var printf = $void.$printf
  var symbols = $void.$symbols

  // provide a field to print for testing purpose
  ;(print.bound || print).nativeField = true

  var printInColor = function (color) {
    return function (text) {
      printf(text + '\n', color)
    }
  }

  var red = printInColor('red')
  var gray = printInColor('gray')
  var green = printInColor('green')

  var signPassed = function () {
    printf('    ' + symbols.passed + '[PASSED] ', 'green')
  }
  var signFailed = function () {
    printf('    ' + symbols.failed + '[FAILED] ', 'red')
  }

  var passing = 0
  var failing = []

  return function () {
    // check native environment
    print('\n  Checking JavaScript environment')
    checkJavascript()

    // check espresso runtime.
    checkRuntime()

    // start to report result
    green('\n  passing: ' + passing)
    if (failing.length < 1) {
      green('\n  Espresso is ready to run.\n')
      return true
    }

    // print failures
    red('  failing: ' + failing.length)
    print('\n  There might be some issues to prevent running Espresso')
    for (var i = 0; i < failing.length; i++) {
      red('  - ' + failing[i])
    }
    print()
    return false
  }

  function passed (feature) {
    passing += 1
    signPassed(); gray(feature)
  }

  function failed (feature) {
    failing.push(feature)
    signFailed(); red(feature)
  }

  function checkJavascript () {
    passed('JS is using the space of ' + (global ? 'global.' : 'window.'))

    ;(typeof Array.isArray === 'undefined' ? failed : passed)('Array.isArray')
    ;(typeof Array.prototype.filter === 'undefined' ? failed : passed)('Array.prototype.filter')
    ;(typeof Array.prototype.forEach === 'undefined' ? failed : passed)('Array.prototype.forEach')
    ;(typeof Array.prototype.map === 'undefined' ? failed : passed)('Array.prototype.map')
    ;(typeof Array.prototype.reduce === 'undefined' ? failed : passed)('Array.prototype.reduce')
    ;(typeof Array.prototype.reduceRight === 'undefined' ? failed : passed)('Array.prototype.reduceRight')

    ;(typeof Date.now === 'undefined' ? failed : passed)('Date.now')

    ;(typeof Number.isInteger === 'undefined' ? failed : passed)('Number.isInteger')
    ;(typeof Number.isSafeInteger === 'undefined' ? failed : passed)('Number.isSafeInteger')
    ;(typeof Number.MAX_SAFE_INTEGER === 'undefined' ? failed : passed)('Number.MAX_SAFE_INTEGER')
    ;(typeof Number.MIN_SAFE_INTEGER === 'undefined' ? failed : passed)('Number.MIN_SAFE_INTEGER')

    ;(typeof Object.assign !== 'function' ? failed : passed)('Object.assign')
    ;(typeof Object.create !== 'function' ? failed : passed)('Object.create')
    ;(typeof Object.defineProperties !== 'function' ? failed : passed)('Object.defineProperties')
    ;(typeof Object.defineProperty !== 'function' ? failed : passed)('Object.defineProperty')
    ;(typeof Object.freeze !== 'function' ? failed : passed)('Object.freeze')
    ;(typeof Object.getOwnPropertyNames !== 'function' ? failed : passed)('Object.getOwnPropertyNames')
    ;(typeof Object.is !== 'function' ? failed : passed)('Object.is')
    ;(typeof Object.isFrozen !== 'function' ? failed : passed)('Object.isFrozen')

    ;(typeof String.prototype.endsWith === 'undefined' ? failed : passed)('String.prototype.endsWith')
    ;(typeof String.prototype.startsWith === 'undefined' ? failed : passed)('String.prototype.startsWith')
    ;(typeof String.prototype.trim === 'undefined' ? failed : passed)('String.prototype.trim')
    ;(typeof String.prototype.trimLeft === 'undefined' ? failed : passed)('String.prototype.trimLeft')
    ;(typeof String.prototype.trimRight === 'undefined' ? failed : passed)('String.prototype.trimRight')

    ;(typeof Promise === 'undefined' ? failed : passed)('Promise')

    ;(typeof Map === 'undefined' ? failed : passed)('Map')
    ;(typeof Set === 'undefined' ? failed : passed)('Set')

    ;(typeof Math.trunc === 'undefined' ? failed : passed)('Math.trunc')
    ;(typeof Math.log2 === 'undefined' ? failed : passed)('Math.log2')
    ;(typeof Math.log10 === 'undefined' ? failed : passed)('Math.log10')

    ;(typeof console !== 'object' ? failed : passed)('console')
    if (typeof console === 'object') {
      ;(typeof console.debug === 'undefined' ? failed : passed)('console.debug')
      ;(typeof console.error === 'undefined' ? failed : passed)('console.error')
      ;(typeof console.info === 'undefined' ? failed : passed)('console.info')
      ;(typeof console.log === 'undefined' ? failed : passed)('console.log')
      ;(typeof console.warn === 'undefined' ? failed : passed)('console.warn')
    }

    ;(((a, b) => (a + b))(...[1, 2]) !== 3 ? failed : passed)('spread operator: ...')
  }

  function checkRuntime () {
    print('\n  Checking Espresso Runtime ...')
    checkObjects($void, '[Void / Null] ', [
      'null'
    ])

    checkFunctions($void, '[Void / constructors] ', [
      // genesis
      'Type', 'Date', 'Range', 'Symbol', 'Tuple',
      'Iterator', 'Promise',
      'Object', 'ClassType',
      // runtime
      'Signal', 'Space', 'OperatorSpace'
    ])

    checkFunctions($void, '[Void / functions] ', [
      // genesis
      'operator', 'lambda', 'function',
      // runtime
      'createAppSpace', 'createModuleSpace',
      'createLambdaSpace', 'createFunctionSpace', 'createOperatorSpace',
      'signalOf',
      'lambdaOf', 'functionOf', 'operatorOf',
      'evaluate', 'execute'
    ])

    checkStaticOperators('[void / operators] ', [
      '`', 'quote', 'unquote',
      'export', 'var', 'let', 'const', 'local', 'locon',
      '?', 'if', 'while', 'in', 'for', 'break', 'continue',
      '+', '++', '--', '!', 'not', '~',
      '@', '=?', '=', '->', '=>', 'redo', 'return', 'exit',
      'import', 'load', 'fetch',
      'debug', 'log'
    ])

    checkObjects($, '[Espresso / types] ', [
      'type',
      'bool', 'string', 'number', 'date', 'range',
      'symbol', 'tuple',
      'operator', 'lambda', 'function',
      'iterator', 'promise',
      'array', 'object', 'set', 'map', 'class'
    ])

    checkFunctions($, '[Espresso / functions] ', [
      // generic
      'commit', 'commit*', 'commit?',
      // runtime
      'eval',
      // bootstrap
      'tokenizer', 'tokenize', 'compiler', 'compile'
    ])

    checkFunctions($void, '[Espresso / functions] ', [
      // runtime
      '$env', 'env', '$run', '$warn', '$print', '$printf'
    ])

    checkStaticOperators('[Espresso / generators] ', [
      'is', '===', 'is-not', '!==',
      'equals', '==', 'not-equals', '!=',
      'compares-to',
      'is-empty', 'not-empty',
      'is-a', 'is-an',
      'is-not-a', 'is-not-an',
      'to-code', 'to-string',
      '>', '>=', '<', '<=',
      // arithmetic: '-', '++', '--', ...
      '+=', '-=', '*=', '/=', '%=',
      // bitwise: '~', ...
      '&=', '|=', '^=', '<<=', '>>=', '>>>=',
      // control: ?
      // general: +, (str +=), (str -=)
      // logical: not, ...
      'and', '&&', '&&=', 'or', '||', '||=',
      '?', '?*', '??',
      '*'
    ])

    checkFunctions($, '[Espresso / generator functions] ', [
      'is', '===', 'is-not', '!==',
      'equals', '==', 'not-equals', '!=',
      'compares-to',
      'is-empty', 'not-empty',
      'is-a', 'is-an',
      'is-not-a', 'is-not-an',
      'to-code', 'to-string',
      '>', '>=', '<', '<=',
      '-', '++', '--',
      '+=', '-=', '*=', '/=', '%=',
      '~',
      '&=', '|=', '^=', '<<=', '>>=', '>>>=',
      '?',
      '+',
      'not', '!',
      'and', '&&', '&&=', 'or', '||', '||=',
      '?', '?*', '??',
      'all', 'both', 'any', 'either', 'not-any', 'neither', 'nor'
    ])

    checkFunctions($, '[Espresso / lib / functions] ', [
      'max', 'min'
    ])

    checkFunctions($void.$app, '[Espresso / lib / app-only functions] ', [
      'env', 'run', 'warn', 'print', 'printf', 'espress'
    ])

    checkObjects($, '[Espresso / lib / objects] ', [
      'uri', 'math', 'json'
    ])

    checkObjects($, '[Espresso / lib / classes] ', [
      'emitter'
    ])

    checkObjects($void.$app, '[Espresso / lib / app classes] ', [
      'timer'
    ])

    // bootstrap tests
    checkTypeOf()
    checkIndexerOf()

    checkTypes()
    checkAssignment()
    checkOperators()
    checkControl()
    checkOperations()
    checkGeneratorAliases()
  }

  function checkObjects ($, group, names) {
    print('\n  -', group)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (typeof $[name] === 'object') {
        passed(name)
      } else {
        failed(group + name)
      }
    }
  }

  function checkFunctions ($, group, names) {
    print('\n  -', group)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (typeof $[name] === 'function') {
        passed(name)
      } else {
        failed(group + name)
      }
    }
  }

  function checkStaticOperators (group, names) {
    print('\n  -', group)
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (typeof $void.staticOperators[name] === 'function') {
        passed(name)
      } else {
        failed(group + name)
      }
    }
  }

  function check (feature, result, error) {
    result ? passed(feature) : failed(error ? feature + ' - ' + error : feature)
  }

  function checkTypeOf () {
    print('\n  - Static type-of')
    var typeOf = $.type.of

    check('[undefined]', typeOf() === null)
    check('null', typeOf(null) === null)

    check('bool', typeOf(true) === $.bool)
    check('string', typeOf('') === $.string)
    check('number', typeOf(1) === $.number)
    check('date', typeOf($.date.empty) === $.date)
    check('range', typeOf($.range.empty) === $.range)
    check('symbol', typeOf($.symbol.empty) === $.symbol)
    check('tuple', typeOf($.tuple.empty) === $.tuple)

    check('operator', typeOf($.operator.empty()) === $.operator)
    check('lambda', typeOf($.lambda.noop) === $.lambda)
    check('stambda', typeOf($.lambda.static) === $.lambda)
    check('function', typeOf($.function.empty()) === $.function)
    check('function (generic)', typeOf(function () {}) === $.function)

    check('iterator', typeOf($.iterator.empty) === $.iterator)
    check('promise', typeOf($.promise.empty) === $.promise)

    check('array', typeOf($.array.empty()) === $.array)
    check('array (generic)', typeOf([]) === $.array)

    check('object', typeOf($.object.empty()) === $.object)
    check('object (generic)', typeOf({}) === $.object)

    check('class', typeOf($.class.empty()) === $.class)
  }

  function checkIndexerOf () {
    print('\n  - Static indexer-of')
    var indexerOf = $void.indexerOf

    check('undefined', indexerOf() === $void.null[':'])
    check('null', indexerOf(null) === $void.null[':'])
    check('type', indexerOf($.type) === $.type[':'])

    check('bool', indexerOf($.bool) === $.bool[':'])
    check('bool: true', indexerOf(true) === $.bool.proto[':'])
    check('bool: false', indexerOf(false) === $.bool.proto[':'])

    check('string', indexerOf($.string) === $.string[':'])
    check('string: empty', indexerOf('') === $.string.proto[':'])

    check('number', indexerOf($.number) === $.number[':'])
    check('number: 0', indexerOf(0) === $.number.proto[':'])

    check('date', indexerOf($.date) === $.date[':'])
    check('date: empty', indexerOf($.date.empty) === $.date.proto[':'])

    check('range', indexerOf($.range) === $.range[':'])
    check('range: empty', indexerOf($.range.empty) === $.range.proto[':'])

    check('symbol', indexerOf($.symbol) === $.symbol[':'])
    check('symbol: empty', indexerOf($.symbol.empty) === $.symbol.proto[':'])

    check('tuple', indexerOf($.tuple) === $.tuple[':'])
    check('tuple: empty', indexerOf($.tuple.empty) === $.tuple.proto[':'])

    check('operator', indexerOf($.operator) === $.operator[':'])
    check('operator.empty', indexerOf($.operator.empty()) === $.operator.proto[':'])

    check('lambda', indexerOf($.lambda) === $.lambda[':'])
    check('lambda: empty', indexerOf($.lambda.empty()) === $.lambda.proto[':'])

    check('function', indexerOf($.function) === $.function[':'])
    check('function: empty', indexerOf($.function.empty()) === $.function.proto[':'])
    check('function: generic', indexerOf(function () {}) === $.function.proto[':'])

    check('iterator', indexerOf($.iterator) === $.iterator[':'])
    check('iterator: empty', indexerOf($.iterator.empty) === $.iterator.proto[':'])

    check('promise', indexerOf($.promise) === $.promise[':'])
    check('promise: empty', indexerOf($.promise.empty) === $.promise.proto[':'])

    check('array', indexerOf($.array) === $.array[':'])
    check('array: empty', indexerOf($.array.empty()) === $.array.proto[':'])
    check('array: generic', indexerOf([]) === $.array.proto[':'])

    check('object', indexerOf($.object) === $.object[':'])
    check('object: empty', indexerOf($.object.empty()) === $.object.proto[':'])
    check('object: generic', indexerOf({}) === $.object.proto[':'])

    check('class', indexerOf($.class) === $.class[':'])
    check('class: empty', indexerOf($.class.empty()) === $.class.proto[':'])
    check('instance: empty', indexerOf($.class.empty().empty()) === $.class.proto.proto[':'])
  }

  function eval_ (expected, expr, desc) {
    var result = $.eval(expr)
    var success = typeof expected === 'function' ? expected(result) : Object.is(result, expected)
    check(expr || desc, success, success || 'evaluated to a value of ' +
      (typeof result) + ': ' + (result ? result.toString() : result))
  }

  function checkTypes () {
    print('\n  - Primary Types')
    eval_(null, '', '<empty>')
    eval_(null, '()')
    eval_(null, 'null')

    eval_($.type, 'type')

    eval_($.bool, 'bool')
    eval_(true, 'true')
    eval_(false, 'false')

    eval_($.string, 'string')
    eval_($.string.empty, '""')
    eval_('ABC', '"ABC"')
    eval_('ABC', '("ABC")')
    eval_(3, '("ABC" length)')
    eval_('ABCDEF', '("ABC" + "DEF")')

    eval_($.number, 'number')
    eval_(3, '(1 + 2)')
    eval_(-1, '(1 - 2)')
    eval_(2, '(1 * 2)')
    eval_(0.5, '(1 / 2)')

    eval_($.date, 'date')
    eval_(function (d) {
      return d instanceof Date
    }, '(date now)')

    eval_($.range, 'range')
    eval_(function (r) {
      return r.begin === 0 && r.end === 3 && r.step === 1
    }, '(0 3)')
    eval_(function (r) {
      return r.begin === 10 && r.end === 20 && r.step === 2
    }, '(10 20 2)')

    eval_($.symbol, 'symbol')
    eval_(function (s) {
      return s.key === 'x'
    }, '(` x)')

    eval_($.tuple, 'tuple')
    eval_(function (t) {
      var l = t.$
      return t instanceof $void.Tuple && l[0].key === 'x' && l[1] === 1 && l[2] === 'y' && l[3] === true
    }, '(` (x 1 "y" true))')

    eval_($.operator, 'operator')
    eval_(function (s) {
      return s.type === $.operator
    }, '(=? () )')
    eval_(function (s) {
      return s.type === $.operator
    }, '(=? (X Y) (+ (X) (Y).')

    eval_($.lambda, 'lambda')
    eval_(function (s) {
      return s.type === $.lambda
    }, '(= () )')
    eval_(function (s) {
      return s.type === $.lambda
    }, '(= (x y) (+ x y).')

    eval_($.function, 'function')
    eval_(function (s) {
      return s.type === $.function
    }, '(=> () )')
    eval_(function (s) {
      return s.type === $.function
    }, '(=> (x y) (+ x y).')

    eval_($.array, 'array')
    eval_(function (a) {
      return a.length === 2 && a[0] === 1 && a[1] === 2
    }, '(array of 1 2)')
    eval_(2, '((@ 10 20) length)')
    eval_(20, '((@ 10 20) 1)')

    eval_($.object, 'object')
    eval_(function (obj) {
      return obj.x === 1 && obj.y === 2
    }, '(@ x: 1 y: 2)')
    eval_(10, '((@ x: 10 y: 20) x)')
    eval_(20, '((@ x: 10 y: 20) y)')
    eval_(200, '((@ x: 10 y: 20) "y" 200)')

    eval_($.class, 'class')
    eval_(function (c) {
      return c.type === $.class
    }, '(@:class x: 1 y: 0)')
    eval_(function (c) {
      return c.type === $.class
    }, '(class of (@ x: 1 y: 0).')
  }

  function checkAssignment () {
    print('\n  - Assignment')
    eval_(1, '(let x 1)')
    eval_(2, '(let x 1) (let y 2)')
    eval_(2, '(let (x y) (@ 1 2). y')
    eval_(2, '(let (x y) (@ x: 1 y: 2). y')
    eval_(2, '(let * (@ x: 1 y: 2). y')

    eval_(1, '(var x 1)')
    eval_(2, '(var x 1) (var y 2)')
    eval_(2, '(var (x y) (@ 1 2). y')
    eval_(2, '(var (x y) (@ x: 1 y: 2). y')
    eval_(2, '(var * (@ x: 1 y: 2). y')

    eval_(1, '(export x 1)')
    eval_(2, '(export x 1) (export y 2)')
    eval_(2, '(export (x y) (@ x: 1 y: 2). y')
    eval_(2, '(export * (@ x: 1 y: 2). y')
  }

  function checkOperators () {
    print('\n  - Operators')
    eval_(1, '(if true 1 else 0)')
    eval_(0, '(if false 1 else 0)')

    eval_(110, '(+ 10 100)')
    eval_(-110, '(+ -10 -100)')

    eval_('10100', '(+ "10" "100")')
    eval_('-10-100', '(+ "-10" "-100")')

    eval_(1, '(++)')
    eval_(-1, '(--)')

    eval_(1, '(++ null)')
    eval_(-1, '(-- null)')

    eval_(1, '(++ 0)')
    eval_(-1, '(-- 0)')

    eval_(1, '(let x 0)(++ x)x')
    eval_(-1, '(let x 0)(-- x)x')

    eval_(true, '(1 ?)')
    eval_(false, '(0 ?)')
    eval_(false, '(null ?)')

    eval_(true, '(true ? 1)')
    eval_(1, '(false ? 1)')

    eval_(1, '(true ? 1 0)')
    eval_(0, '(false ? 1 0)')

    eval_(0, '(null ?? 0)')
    eval_(false, '(false ?? 0)')
    eval_(0, '(0 ?? 1)')
    eval_('', '("" ?? 1)')
  }

  function checkControl () {
    print('\n  - Control')
    eval_(0, '(if true 1 0)')
    eval_(null, '(if false 1 0)')
    eval_(1, '(if true 1 else 0)')
    eval_(0, '(if false 1 else 0)')

    eval_(10, '(for x in (100 110) (++ i).')
    eval_(10, '(var i 0)(for (@ 1 2 3 4) (i += _).')
    eval_(99, '(while ((++ i) < 100) i)')
    eval_(100, '(let i 0)(while ((i ++) < 100) i)')
    eval_(100, '(while ((++ i) < 100). i')
    eval_(101, '(let i 0)(while ((i ++) < 100). i')
    eval_('done', '(while ((++ i) < 100) (if (i == 10) (break "done").')
  }

  function checkOperations () {
    print('\n  - Operations')
    eval_(21, '(let x 1) (let y 20) (let add (=? (a b) ((a) + (b). (add x y)')

    eval_(21, '(let z 100) (let add (= (x y) (x + y z). (add 1 20)')
    eval_(21, '(let z 100) (= (1 20): (x y) (x + y z).')

    eval_(121, '(let z 100) (let add (=> (x y) (x + y z). (add 1 20)')
    eval_(121, '(let z 100) (=> (1 20): (x y) (x + y z).')

    eval_(11, '(let summer (@:class add: (= () ((this x) + (this y). (let s (summer of (@ x: 1 y: 10). (s add)')
    eval_(11, '(let summer (@:class type: (@ add: (= (x y ) (+ x y). (summer add 1 10)')
  }

  function checkGeneratorAliases () {
    print('\n  - Generator Aliases')
    function checkAlias (a, b) {
      check('"' + a + '" is "' + b + '"',
        Object.is($void.staticOperators[a], $void.staticOperators[b])
      )
    }

    checkAlias('is', '===')
    checkAlias('is-not', '!==')

    checkAlias('equals', '==')
    checkAlias('not-equals', '!=')

    checkAlias('is-a', 'is-an')
    checkAlias('is-not-a', 'is-not-an')

    checkAlias('not', '!')
    checkAlias('and', '&&')
    checkAlias('or', '||')
  }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./web/index.js":
/*!**********************!*\
  !*** ./web/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getWindowOrigin () {
  return window.location.origin || (
    window.location.protocol + '//' + window.location.host
  )
}

function getPageHome () {
  var origin = getWindowOrigin()
  var href = window.location.href
  var home = href.substring(0, href.lastIndexOf('/'))
  return !home || home.length < origin.length ? origin : home
}

module.exports = function $void (term, stdout, loader) {
  term || (term = __webpack_require__(/*! ./lib/console */ "./web/lib/console.js")())
  stdout || (stdout = __webpack_require__(/*! ./lib/stdout */ "./web/lib/stdout.js")(term))

  // create the void.
  var $void = __webpack_require__(/*! ../es/start */ "./es/start.js")(stdout)

  // set the location of the runtime
  $void.env('runtime-home', window.ES_HOME || getWindowOrigin())

  // prepare app environment.
  var home = getPageHome()
  $void.env('home', home)
  $void.env('user-home', home)
  $void.env('os', window.navigator.userAgent)

  // create the source loader
  $void.loader = (loader || __webpack_require__(/*! ../lib/loader/http */ "./lib/loader/http.js"))($void)

  // mount native module loader
  $void.module = __webpack_require__(/*! ../lib/module */ "./lib/module.js")($void)
  $void.module.native = __webpack_require__(/*! ./lib/module-native */ "./web/lib/module-native.js")($void)

  var bootstrap = $void.createBootstrapSpace(home + '/@')

  function prepare (context) {
    return typeof context === 'function'
      ? context // a customized initializer function.
      : typeof context === 'string'
        ? executor.bind(null, context) // an initialization profile.
        : Array.isArray(context) ? function () {
          // a list of dependency modules
          return bootstrap.$fetch(context)
        } : function () {
          // try to fetch the default root module loader.
          return bootstrap.$fetch('@')
        }
  }

  function executor (profile) {
    return new Promise(function (resolve, reject) {
      bootstrap.$fetch(profile).then(function () {
        resolve(bootstrap.$load(profile))
      }, reject)
    })
  }

  function initialize (context, main) {
    var preparing = prepare(context)
    var prepared = preparing(bootstrap, $void)
    return !(prepared instanceof Promise) ? main()
      : new Promise(function (resolve, reject) {
        prepared.then(function () { resolve(main()) }, reject)
      })
  }

  $void.web = Object.create(null)
  $void.web.initialize = initialize

  $void.web.run = function run (context, app, args, appHome) {
    return initialize(context, function () {
      return $void.$run(app, args, appHome)
    })
  }

  $void.web.shell = function shell (context, stdin, exit) {
    return initialize(context, function () {
      __webpack_require__(/*! ../lib/shell */ "./lib/shell.js")($void)(
        stdin || __webpack_require__(/*! ./lib/stdin */ "./web/lib/stdin.js")($void, term),
        exit || __webpack_require__(/*! ./lib/exit */ "./web/lib/exit.js")($void)
      )
    })
  }

  return $void
}


/***/ }),

/***/ "./web/lib/app.js":
/*!************************!*\
  !*** ./web/lib/app.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var term = __webpack_require__(/*! ./term */ "./web/lib/term.js")()
var $void = __webpack_require__(/*! ../index */ "./web/index.js")(
  term /*, - use web page based terminal
  stdout,  - use default [term + console (as tracer)] based stdout
  loader   - use default axios-based http loader */
)

// start shell and expose the shell's reader function.
var initializing = $void.web.shell(/*
  context, - fetch from the default url: page-home/@.es
  stdin,   - use default term-based stdin
  exit     - use reloading page to mimic an exit */
)

if (!(initializing instanceof Promise)) {
  console.info('shell is ready.')
} else {
  console.info('initializing shell ...')
  initializing.then(function () {
    console.info('shell is ready now.')
  }, function (err) {
    console.error('shell failed to initialize for', err)
  })
}


/***/ }),

/***/ "./web/lib/console.js":
/*!****************************!*\
  !*** ./web/lib/console.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function nop () {}

module.exports = function console () {
  var term = Object.create(null)
  var buffer = ''

  // serve stdout
  term.print = function (text) {
    if (buffer) {
      text = buffer + text
      buffer = ''
    }
    console.log(text)
  }

  term.printf = function (text) {
    var lines = text.split('\n')
    var ending = lines.pop()
    if (lines.length > 0) {
      lines[0] = buffer + lines[0]
      buffer = ending
      console.log(lines.join('\n'))
    } else {
      buffer += ending
    }
  }

  // serve stderr - tracing logic will work.
  term.verbose = nop
  term.info = nop
  term.warn = nop
  term.error = nop
  term.debug = nop

  // serve shell
  var echos = []
  term.echo = function (text) {
    echos.push(text)
  }

  // serve stdin
  var inputPrompt = '>'
  term.prompt = function (text) {
    text && (inputPrompt = text)
  }

  term.connect = function (reader) {
    window._$ = function shell (line) {
      if (typeof line === 'string') {
        reader(line)
        if (echos.length > 0) {
          var output = echos.join('\n '); echos = []
          return output
        }
        if (!inputPrompt.startsWith('>')) {
          console.info(inputPrompt)
        }
      } else {
        console.error('input is not a string:', line)
      }
    }
    return reader
  }

  term.disconnect = function () {
    window._$ = null
  }

  return term
}


/***/ }),

/***/ "./web/lib/exit.js":
/*!*************************!*\
  !*** ./web/lib/exit.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function reload (print) {
  var counter = 3
  setInterval(function () {
    if (counter > 0) {
      print(counter--)
    } else {
      window.location.reload()
    }
  }, 500)
  return 'reloading ...'
}

module.exports = function exitIn ($void) {
  return function exit (code) {
    return reload(function (counter) {
      switch (counter) {
        case 1:
          return $void.$printf('.' + counter, 'red')
        case 2:
          return $void.$printf('..' + counter, 'yellow')
        default:
          return $void.$printf('...' + counter, 'blue')
      }
    })
  }
}


/***/ }),

/***/ "./web/lib/module-native.js":
/*!**********************************!*\
  !*** ./web/lib/module-native.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function module$native ($void, packer) {
  var warn = $void.$warn
  var native = Object.create(null)
  var runtimeModules = __webpack_require__(/*! ./modules */ "./web/lib/modules/index.js")($void)

  native.resolve = function (moduleUri, moduleDir, appHome, appDir, userHome) {
    if (runtimeModules.has(moduleUri)) {
      return moduleUri
    }

    if (!packer) {
      warn('module-native', 'no module packer provided.', [moduleUri, moduleDir])
      return null
    }

    try {
      var request = moduleUri.substring(1)
      var moduleId = packer.resolve(request, moduleDir)
      if (moduleId) {
        return '$' + moduleId
      }
      warn('module-native', 'failed to resolve native module.', [
        moduleUri, moduleDir, appHome, appDir, userHome
      ])
    } catch (err) {
      warn('module-native', 'error in resolving native module.', [
        err, moduleUri, moduleDir, appHome, appDir, userHome
      ])
    }
    return null
  }

  native.load = function load (resolvedUri) {
    var request = resolvedUri.substring(1)
    var mod = runtimeModules.load(request)
    if (mod) {
      return mod
    }
    if (packer) {
      return packer.load(request)
    }
    var err = new Error('[No Packer] Cannot find module ' + request)
    err.code = 'MODULE_NOT_FOUND'
    throw err
  }

  return native
}


/***/ }),

/***/ "./web/lib/modules/index.js":
/*!**********************************!*\
  !*** ./web/lib/modules/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var RuntimeModules = new Set([
  '$eslang/global',
  '$eslang/io',
  '$eslang/path',
  '$eslang/symbols'
])

module.exports = function modulesIn ($void) {
  $void.$io = __webpack_require__(/*! ./io */ "./web/lib/modules/io.js")($void)
  $void.$path = __webpack_require__(/*! ./path */ "./web/lib/modules/path.js")($void)
  $void.$symbols = __webpack_require__(/*! ../../../lib/modules/symbols */ "./lib/modules/symbols.js")($void)

  var modules = Object.create(null)
  var eslang = Object.create(null) // not recommended to import all.

  modules.has = function has (moduleUri) {
    return moduleUri === '$eslang' ||
      moduleUri.startsWith('$eslang/') ||
      RuntimeModules.has(moduleUri)
  }

  modules.load = function load (name) {
    if (name === '$eslang' || name.startsWith('$eslang/')) {
      return eslang
    }
    switch (name) {
      case 'eslang/global':
        return window
      case 'eslang/io':
        return $void.$io
      case 'eslang/path':
        return $void.$path
      case 'eslang/symbols':
        return $void.$symbols
      default:
        return null
    }
  }

  return modules
}


/***/ }),

/***/ "./web/lib/modules/io.js":
/*!*******************************!*\
  !*** ./web/lib/modules/io.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var tempStorage = Object.create(null)
var tempSession = Object.create(null)

function storeOf (storage) {
  return {
    getItem: function (key) {
      return storage[key]
    },
    setItem: function (key, value) {
      storage[key] = value
    }
  }
}

module.exports = function $io ($void) {
  var warn = $void.$warn
  var thisCall = $void.thisCall
  var stringOf = $void.$.string.of

  var $io = Object.create(null)

  var storage = window.localStorage || storeOf(tempStorage)
  var session = window.sessionStorage || storeOf(tempSession)

  function chooseStoreBy (path) {
    return path.startsWith('~/') ? session : storage
  }

  function formatPath (method, path) {
    if (path && typeof path === 'string') {
      return path
    }
    if (!Array.isArray(path)) {
      warn('io:' + method, 'argument path is not a string or strings.', [path])
      return null
    }
    path = path.slice()
    for (var i = 0, len = path.length; i < len; i++) {
      if (typeof path[i] !== 'string') {
        path[i] = thisCall(path[i], 'to-string')
      }
    }
    return path.join('/')
  }

  $io.read = function read (path) {
    path = formatPath('read', path)
    return path ? chooseStoreBy(path).getItem(path) : null
  }

  $io.write = function write (path, value) {
    path = formatPath('write', path)
    if (!path) {
      return null
    }
    value = typeof value === 'undefined' ? stringOf() : stringOf(value)
    chooseStoreBy(path).setItem(path, value)
    return value
  }

  $io['to-read'] = function read_ (path) {
    path = formatPath('to-read', path)
    return !path ? Promise.reject(warn())
      : Promise.resolve(chooseStoreBy(path).getItem(path))
  }

  $io['to-write'] = function write_ (path, value) {
    path = formatPath('to-write', path)
    if (!path) {
      return Promise.reject(warn())
    }
    value = typeof value === 'undefined' ? stringOf() : stringOf(value)
    chooseStoreBy(path).setItem(path, value)
    return Promise.resolve(value)
  }

  return $io
}


/***/ }),

/***/ "./web/lib/modules/path.js":
/*!*********************************!*\
  !*** ./web/lib/modules/path.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Delimiter = ':'
var Separator = '/'

var RegexUrl = /^(\w+:\/\/)/i

function invalidType (arg, value, type) {
  var err = new TypeError(
    'The "' + arg + '" argument must be of type ' + (type || 'string') +
    '. Received ' + (typeof value)
  )
  err.code = 'ERR_INVALID_ARG_TYPE'
  return err
}

function parseUrl (path) {
  try {
    return new URL(path)
  } catch (err) {
    return null
  }
}

module.exports = function pathIn ($void) {
  var BaseUrl = $void.$env('home')

  var $path = {} // use the same type as it's in nodejs.
  $path.delimiter = Delimiter
  $path.sep = Separator

  $path.basename = function basename (path, ext) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }
    if (typeof ext !== 'string' && typeof ext !== 'undefined') {
      throw invalidType('ext', ext)
    }

    if (RegexUrl.test(path)) {
      var url = parseUrl(path)
      if (!url) return ''
      path = new URL(path).pathname
    }

    var offset = path.lastIndexOf(Separator)
    if (offset >= 0) {
      path = path.substring(offset + 1)
    }

    if (ext && path.endsWith(ext) && path.length > ext.length) {
      return path.substring(0, path.length - ext.length)
    }
    return path
  }

  $path.dirname = function dirname (path) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }

    var origin
    if (RegexUrl.test(path)) {
      var url = parseUrl(path)
      if (!url) return path

      origin = url.protocol + '//' + url.host
      path = url.pathname
    }

    var offset = path.length
    while (offset > 0 && path[offset - 1] === Separator) {
      offset--
    }
    if (offset < path.length) {
      path = path.substring(0, offset)
    }

    offset = path.lastIndexOf(Separator)
    switch (offset) {
      case -1:
        return origin || '.'
      case 0:
        return origin || Separator
      default:
        return origin ? origin + path.substring(0, offset) : path.substring(0, offset)
    }
  }

  $path.extname = function extname (path) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }

    if (RegexUrl.test(path)) {
      var url = parseUrl(path)
      if (!url) return ''
      path = new URL(path).pathname
    }

    var offset = path.lastIndexOf('.')
    if (offset <= 0) {
      return ''
    }

    var sep = path.lastIndexOf(Separator) + 1
    if (sep >= offset) {
      return ''
    }

    offset += 1
    return offset >= path.length ? '.' : path.substring(offset)
  }

  var PathObjectKeys = ['dir', 'root', 'base', 'name', 'ext']
  $path.format = function format (pathObject) {
    if (typeof pathObject !== 'object') {
      throw invalidType('pathObject', pathObject, 'object')
    }
    PathObjectKeys.forEach(function (key) {
      var value = pathObject[key]
      if (typeof value !== 'string' && typeof value !== 'undefined' && value !== null) {
        throw invalidType('pathObject.' + key, value)
      }
    })

    var paths = []
    if (pathObject.dir && RegexUrl.test(pathObject.dir)) {
      paths.push(pathObject.dir)
    } else {
      pathObject.root && paths.push(pathObject.root)
      pathObject.dir && paths.push(pathObject.dir)
    }

    if (pathObject.base) {
      paths.push(pathObject.base)
    } else {
      pathObject.name && paths.push(pathObject.name)
      pathObject.ext && paths.push(pathObject.ext)
    }

    return $path.join.apply($path, paths)
  }

  $path.isAbsolute = function isAbsolute (path) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }
    return RegexUrl.test(path)
  }

  $path.join = function join (paths) {
    paths = Array.prototype.slice.call(arguments)
    paths.forEach(function (path) {
      if (typeof path !== 'string') {
        throw invalidType('path', path)
      }
    })
    return $path.normalize(paths.join(Separator)) || '.'
  }

  function reduce (root, segments) {
    for (var i = 0; i < segments.length;) {
      if (!segments[i]) {
        segments.splice(i, 1); continue
      }
      if (segments[i] === '.' && (i > 0 || root)) {
        segments.splice(i, 1); continue
      }
      if (segments[i] !== '..') {
        i += 1; continue
      }
      if (i === 0) {
        root ? segments.splice(i, 1) : (i += 1)
        continue
      }
      if (segments[i - 1] === '..') {
        i += 1; continue
      }
      if (segments[i - 1] === '.') {
        segments.splice(i - 1, 1)
      } else {
        segments.splice(i - 1, 2)
        i -= 1
      }
    }
    return segments
  }

  $path.normalize = function normalize (path) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }

    var root
    if (RegexUrl.test(path)) {
      var url = parseUrl(path)
      if (!url) return path

      root = url.protocol + '//' + url.host
      path = url.pathname
    } else if (path.startsWith(Separator)) {
      root = Separator
    }

    var segments = reduce(root, path.split(Separator))
    var pathname = segments.join(Separator)
    return !root ? pathname
      : root === Separator || !pathname ? root + pathname
        : root + Separator + pathname
  }

  $path.parse = function normalize (path) {
    if (typeof path !== 'string') {
      throw invalidType('path', path)
    }

    var pathObject = { base: '', name: '', ext: '' }
    pathObject.dir = $path.dirname(path)

    if (RegexUrl.test(path)) {
      var offset = path.indexOf('://') + 3
      offset = path.indexOf(Separator, offset)
      if (offset < 0) {
        pathObject.root = path
        return pathObject
      }
      pathObject.root = path.substring(0, offset)
    } else {
      pathObject.root = ''
    }

    pathObject.base = $path.basename(path)
    pathObject.ext = $path.extname(path)
    pathObject.name = pathObject.ext
      ? $path.basename(path, pathObject.ext)
      : pathObject.base

    return pathObject
  }

  $path.relative = function relative (from, to) {
    if (typeof from !== 'string') {
      throw invalidType('from', from)
    }
    if (typeof to !== 'string') {
      throw invalidType('to', from)
    }

    var fromSegments = $path.normalize(from).split(Separator)
    var toSegments = $path.normalize(to).split(Separator)
    if (fromSegments[0] !== toSegments[0]) {
      return from
    }
    var i = 1
    for (; i < fromSegments.length && i < toSegments.length; i++) {
      if (fromSegments[i] !== toSegments[i]) {
        break
      }
    }
    var segments = []
    for (var j = i; j < fromSegments.length; j++) {
      segments.push('..')
    }
    for (var k = i; k < toSegments.length; k++) {
      segments.push(toSegments[k])
    }
    return segments.join(Separator)
  }

  $path.resolve = function resolve (base) {
    var paths = Array.prototype.slice.call(arguments)
    var rootOffset = -1
    paths.forEach(function (path, i) {
      if (typeof path !== 'string') {
        throw invalidType('path', path)
      }
      if (RegexUrl.test(path)) {
        rootOffset = i
      }
    })
    if (rootOffset < 0) {
      paths.unshift(BaseUrl)
    } else if (rootOffset > 0) {
      paths = paths.slice(rootOffset)
    }
    return $path.join.apply($path, paths)
  }

  return $path
}


/***/ }),

/***/ "./web/lib/stdin.js":
/*!**************************!*\
  !*** ./web/lib/stdin.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function stdinIn ($void, term) {
  var stdin = Object.create(null)
  stdin.echo = term.echo
  stdin.prompt = term.prompt

  var connected = false
  var interpret = null
  var reader = function (line) {
    return interpret && interpret(line)
  }

  stdin.open = function open () {
    if (!connected) {
      connected = true
      term.connect(reader)
    }
  }

  stdin.on = function on (event, callback) {
    connected || stdin.open()
    switch (event) {
      case 'line':
        interpret = callback
        return event
      default:
        return null
    }
  }

  stdin.close = function close () {
    if (connected) {
      term.disconnect()
      interpret = null
      connected = false
    }
  }

  return stdin
}


/***/ }),

/***/ "./web/lib/stdout.js":
/*!***************************!*\
  !*** ./web/lib/stdout.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var tracer = __webpack_require__(/*! ../../lib/stdout */ "./lib/stdout.js")

module.exports = function $stdout (term) {
  return function stdoutIn ($void) {
    var stdout = Object.create(null)

    var tracing = tracer($void)

    function forward (type) {
      return function trace () {
        var trace = tracing[type]
        var text = trace.apply(null, arguments)
        term[type](text)
        return text
      }
    }

    for (var type in tracing) {
      stdout[type] = type !== 'printf'
        ? forward(type)
        : function printf (value, format) {
          value = tracing.printf(value)
          term.printf(value, format)
          return value
        }
    }

    return stdout
  }
}


/***/ }),

/***/ "./web/lib/term.js":
/*!*************************!*\
  !*** ./web/lib/term.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var style = __webpack_require__(/*! ../../lib/style */ "./lib/style.js")

var MaxLines = 2400
var DrainBatch = 300

var KeyEnter = 0x0D
var KeyUpArrow = 0x26
var KeyDownArrow = 0x28

// the key to be used in localStorage
var InputHistoryKey = '~/.es_history'

// Firefox, IE and Edge require a non-zero timeout to refresh UI.
var MinimalDelay = 20 // milliseconds

var pool = []
var spooling = false
var panel, input, enter

function enqueue (task) {
  if (pool.length > (MaxLines * 2)) {
    pool = pool.slice(MaxLines)
  }
  pool.push(task)
}

function drain () {
  if (pool.length < 1) { return }
  setTimeout(function () {
    var tasks = pool.splice(0, DrainBatch)
    for (var i = 0, len = tasks.length; i < len; i++) {
      var task = tasks[i]
      task[0](task[1], task[2], true)
    }
    drain()
  }, MinimalDelay)
}

function updatePanel () {
  if (panel.childElementCount > MaxLines) {
    var half = MaxLines / 2
    while (panel.childElementCount > half) {
      panel.removeChild(panel.firstElementChild)
    }
  }
  window.scrollTo(0, document.body.scrollHeight)
  input.focus()
}

var currentLine = null

function writeTo (panel) {
  function write (text, render, draining) {
    if (!draining && (spooling || pool.length > 0)) {
      return enqueue([write, text, render])
    }
    var lines = text.split('\n')
    var spans = []
    for (var i = 0, last = lines.length - 1; i <= last; i++) {
      var line = lines[i]
      if (i > 0 || !line) {
        currentLine = null
      }
      if (line) {
        spans.push(
          appendText(currentLine || (currentLine = createNewLine()), line)
        )
      } else if (i < last) {
        createNewLine(document.createElement('br'))
      }
    }
    if (render && spans.length > 0) {
      for (var j = 0, len = spans.length; j < len; j++) {
        render(spans[j])
      }
    }
    updatePanel()
  }
  return write
}

function createNewLine (child) {
  var li = document.createElement('li')
  li.className = 'print'
  if (child) {
    li.appendChild(child)
  }
  panel.appendChild(li)
  return li
}

function appendText (li, text) {
  var span = document.createElement('span')
  span.className = 'text'
  span.appendChild(document.createTextNode(replaceWhitespace(text)))
  li.appendChild(span)
  return span
}

function styleOf (format) {
  var style = ''
  for (var key in format) {
    var value = format[key]
    if (value instanceof Set) {
      value = Array.from(value)
    }
    if (Array.isArray(value)) {
      value = value.join(' ')
    }
    if (typeof value === 'string') {
      style += key + ': ' + value + ';'
    }
  }
  return style
}

function applyStyle (obj) {
  var style = styleOf(obj)
  return style && function (span) {
    span.style.cssText = style
  }
}

function logTo (panel, type, max) {
  function log (prompt, text, draining) {
    if (!draining && (spooling || pool.length > 0)) {
      return enqueue([log, prompt, text])
    }
    if (max && text.length > max) {
      text = text.substring(0, max - 10) + '... ... ...' +
        text.substring(text.length - 10) +
        ' # use (print ...) to display all text.'
    }
    var lines = text.split('\n')
    for (var i = 0, len = lines.length; i < len; i++) {
      var li = document.createElement('li')
      li.className = type
      lines[i] ? appendLine(li, lines[i], i > 0 ? '' : prompt)
        : li.appendChild(document.createElement('br'))
      panel.appendChild(li)
    }
    updatePanel()
  }
  return log
}

function appendLine (li, text, prompt) {
  var span = document.createElement('span')
  span.className = 'prompt'
  if (prompt) {
    span.appendChild(document.createTextNode(prompt))
  }
  li.appendChild(span)
  span = document.createElement('span')
  span.className = 'text'
  span.appendChild(document.createTextNode(replaceWhitespace(text)))
  li.appendChild(span)
}

function replaceWhitespace (text) {
  var spaces = ''
  for (var i = 0; i < text.length; i++) {
    if (!/\s/.test(text.charAt(i))) {
      return spaces + text.slice(i)
    } else {
      spaces += '\u00A0'
    }
  }
  return text
}

function loadHistory () {
  if (!window.localStorage) {
    return []
  }
  var data = window.localStorage.getItem(InputHistoryKey)
  if (!data) {
    return []
  }
  try {
    var history = JSON.parse(data)
    return Array.isArray(history) ? history : []
  } catch (err) {
    console.warn('failed to load input history:', err)
    return []
  }
}

function updateHistory (records, value) {
  if (records.length > 0 && records[records.length - 1] === value) {
    return records.length
  }
  records.push(value)
  if (records.length > 1000) {
    records = records.slice(-1000)
  }
  if (window.localStorage) {
    try {
      window.localStorage.setItem(InputHistoryKey, JSON.stringify(records))
    } catch (err) {
      console.warn('failed to save input history:', err)
    }
  }
  return records.length
}

function bindInput (term) {
  var inputHistory = loadHistory()
  var inputOffset = inputHistory.length
  var inputValue = ''

  function exec (value) {
    if (term.reader) {
      setTimeout(function () {
        spooling = true
        term.reader(value)
        spooling = false
        drain()
      }, MinimalDelay)
    }
  }

  enter.onclick = function () {
    if (!input.value) {
      return
    }
    var value = input.value
    input.value = ''
    inputValue = ''
    inputOffset = updateHistory(inputHistory, value)
    term.input(value)
    exec(value)
  }
  input.addEventListener('keypress', function (event) {
    if (event.keyCode === KeyEnter) {
      event.preventDefault()
      enter.onclick()
    }
  })
  input.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
      case KeyUpArrow:
        (inputOffset === inputHistory.length) && (inputValue = input.value)
        if (--inputOffset >= 0 && inputOffset < inputHistory.length) {
          input.value = inputHistory[inputOffset]
        } else {
          inputOffset = inputHistory.length
          input.value = inputValue
        }
        break
      case KeyDownArrow:
        (inputOffset === inputHistory.length) && (inputValue = input.value)
        if (++inputOffset < inputHistory.length) {
          input.value = inputHistory[inputOffset]
        } else if (inputOffset > inputHistory.length) {
          inputOffset = 0
          if (inputOffset < inputHistory.length) {
            input.value = inputOffset < inputHistory.length
              ? inputHistory[inputOffset] : ''
          }
        } else {
          input.value = inputValue
        }
        break
      default:
        return
    }
    event.preventDefault()
  })
  input.focus()
}

module.exports = function () {
  var term = Object.create(null)

  panel = document.getElementById('stdout-panel')
  input = document.getElementById('stdin-input')
  enter = document.getElementById('stdin-enter')

  // serve stdout
  var writerOf = writeTo.bind(null, panel)
  var write = writerOf('print')

  term.print = function (text) {
    write(text.charAt(text.length - 1) === '\n' ? text : text + '\n')
  }

  term.printf = function (text, format) {
    var render = applyStyle(style.parse(format))
    write(text, render)
  }

  // serve stderr
  var loggerOf = logTo.bind(null, panel)
  term.verbose = loggerOf('verbose').bind(null, '#V')
  term.info = loggerOf('info').bind(null, '#I')
  term.warn = loggerOf('warn').bind(null, '#W')
  term.error = loggerOf('error').bind(null, '#E')
  term.debug = loggerOf('debug').bind(null, '#D')

  // serve shell
  term.echo = loggerOf('echo', 150).bind(null, '=')

  // serve stdin
  var inputPrompt = '>'
  var prompt = document.getElementById('stdin-prompt')
  term.prompt = function (text) {
    if (text) {
      prompt.innerText = inputPrompt = text
    }
  }

  var writeInput = loggerOf('input')
  term.input = function (text) {
    writeInput(inputPrompt, text)
  }
  bindInput(term)

  term.connect = function (reader) {
    return (term.reader = typeof reader === 'function' ? reader : null)
  }

  term.disconnect = function () {
    term.reader = null
  }
  return term
}


/***/ })

/******/ });
//# sourceMappingURL=eslang.js.map