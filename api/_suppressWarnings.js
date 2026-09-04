// @ts-nocheck
import url from 'node:url';

/**
 * WHATWG-based drop-in replacement for legacy url.parse.
 * Node.js deprecated url.parse (DEP0169) due to security and standardization issues.
 * By completely replacing url.parse with a WHATWG URL-based parser:
 * 1. Native deprecated url.parse is NEVER called.
 * 2. DEP0169 warnings are prevented at their root across all runtime frameworks.
 */
function whatwgUrlParse(urlStr, parseQueryString) {
  if (typeof urlStr !== 'string') {
    return urlStr;
  }
  try {
    const base = 'https://www.npnewsmetro.com';
    const isFull = /^https?:\/\//i.test(urlStr) || urlStr.startsWith('//');
    const target = isFull
      ? (urlStr.startsWith('//') ? 'https:' + urlStr : urlStr)
      : new URL(urlStr.startsWith('/') ? urlStr : '/' + urlStr, base).href;

    const parsed = new URL(target);

    let query = null;
    if (parseQueryString) {
      query = {};
      parsed.searchParams.forEach((v, k) => {
        query[k] = v;
      });
    } else if (parsed.search) {
      query = parsed.search.slice(1);
    }

    return {
      protocol: isFull ? parsed.protocol : null,
      slashes: isFull ? true : null,
      auth: (parsed.username || parsed.password) ? `${parsed.username}:${parsed.password}` : null,
      host: isFull ? parsed.host : null,
      port: isFull ? (parsed.port || null) : null,
      hostname: isFull ? parsed.hostname : null,
      hash: parsed.hash || null,
      search: parsed.search || null,
      query: query,
      pathname: parsed.pathname,
      path: parsed.pathname + (parsed.search || ''),
      href: isFull ? parsed.href : (parsed.pathname + (parsed.search || '') + (parsed.hash || '')),
    };
  } catch {
    return {
      protocol: null,
      slashes: null,
      auth: null,
      host: null,
      port: null,
      hostname: null,
      hash: null,
      search: null,
      query: parseQueryString ? {} : null,
      pathname: urlStr,
      path: urlStr,
      href: urlStr,
    };
  }
}

// 1. Install WHATWG URL replacement on url.parse
if (url) {
  try {
    Object.defineProperty(url, 'parse', {
      value: whatwgUrlParse,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch {
    url.parse = whatwgUrlParse;
  }
}

// 2. Intercept process.emit('warning', ...) at the event loop level
if (typeof process !== 'undefined' && typeof process.emit === 'function') {
  const originalEmit = process.emit;
  process.emit = function (name, data, ...extra) {
    if (name === 'warning') {
      const isDep = data && (
        (data.name === 'DeprecationWarning') ||
        (data.code === 'DEP0169') ||
        (typeof data.message === 'string' && (data.message.includes('url.parse') || data.message.includes('DEP0169'))) ||
        (typeof data === 'string' && (data.includes('url.parse') || data.includes('DEP0169')))
      );
      if (isDep) {
        return false;
      }
    }
    return originalEmit.apply(this, [name, data, ...extra]);
  };
}

// 3. Intercept process.emitWarning
if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function (warning, ...args) {
    if (
      (typeof warning === 'string' && (warning.includes('url.parse') || warning.includes('DEP0169'))) ||
      (args[0] === 'DEP0169' || args[1] === 'DEP0169') ||
      (warning && typeof warning === 'object' && (warning.code === 'DEP0169' || warning.name === 'DEP0169' || (warning.message && warning.message.includes('url.parse'))))
    ) {
      return;
    }
    return originalEmitWarning.apply(process, [warning, ...args]);
  };
}
