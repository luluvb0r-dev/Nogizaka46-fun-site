(function () {
  'use strict';

  const ENDPOINT = '/client-errors';
  const MAX_PAYLOAD = 10 * 1024; // 10KB
  const MAX_STACK = 8 * 1024;    // 8KB
  const timestamps = [];

  function serialize(data) {
    let json = JSON.stringify(data);
    if (json.length > MAX_PAYLOAD && data.stack) {
      data.stack = data.stack.slice(0, MAX_STACK);
      json = JSON.stringify(data);
    }
    return json;
  }

  function send(data) {
    data.time = new Date().toISOString();
    data.url = location.href;
    data.userAgent = navigator.userAgent;
    const json = serialize(data);
    const blob = new Blob([json], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) {
      return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    });
  }

  function rateLimitedSend(data) {
    const now = Date.now();
    while (timestamps.length && now - timestamps[0] > 1000) {
      timestamps.shift();
    }
    if (timestamps.length >= 5) {
      return;
    }
    timestamps.push(now);
    send(data);
  }

  window.addEventListener('error', function (e) {
    rateLimitedSend({
      type: 'error',
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack || null
    });
  });

  window.addEventListener('unhandledrejection', function (e) {
    const reason = e.reason;
    let message = '';
    let stack = null;
    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack;
    } else {
      message = String(reason);
    }
    rateLimitedSend({
      type: 'unhandledrejection',
      message: message,
      stack: stack
    });
  });

  ['log', 'warn', 'error'].forEach(function (level) {
    const original = console[level];
    console[level] = function (...args) {
      original.apply(console, args);
      rateLimitedSend({
        type: 'console',
        level: level,
        message: args.map(a => String(a)).join(' ')
      });
    };
  });
})();
