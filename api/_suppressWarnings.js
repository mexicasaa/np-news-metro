// @ts-nocheck
import url from 'node:url';

// 1. Intercept process.emitWarning to completely silence DEP0169 url.parse deprecation warnings
if (typeof process !== 'undefined' && process.emitWarning) {
  const originalEmit = process.emitWarning;
  process.emitWarning = function (warning, ...args) {
    if (
      (typeof warning === 'string' && (warning.includes('url.parse') || warning.includes('DEP0169'))) ||
      (args[0] === 'DEP0169' || args[1] === 'DEP0169') ||
      (warning && typeof warning === 'object' && (warning.code === 'DEP0169' || warning.name === 'DEP0169' || (warning.message && warning.message.includes('url.parse'))))
    ) {
      return;
    }
    return originalEmit.apply(process, [warning, ...args]);
  };
}

// 2. Wrap url.parse to suppress any warnings during execution across third-party callers
if (url && typeof url.parse === 'function') {
  const origParse = url.parse;
  url.parse = function (...args) {
    if (typeof process !== 'undefined' && process.emitWarning) {
      const savedEmit = process.emitWarning;
      process.emitWarning = () => {};
      try {
        return origParse.apply(this, args);
      } finally {
        process.emitWarning = savedEmit;
      }
    }
    return origParse.apply(this, args);
  };
}
