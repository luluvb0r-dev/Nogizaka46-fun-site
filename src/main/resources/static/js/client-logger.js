/**
 * ブラウザで発生した JavaScript エラーやコンソール出力を
 * サーバへ送信するロガー。
 */
(function () {
  'use strict';

  // 送信先エンドポイント
  const ENDPOINT = '/client-errors';
  // ペイロード全体の最大サイズ (10KB)
  const MAX_PAYLOAD = 10 * 1024; // 10KB
  // stack プロパティの最大長 (8KB)
  const MAX_STACK = 8 * 1024;    // 8KB
  // 直近送信時刻の履歴（レート制限用）
  const timestamps = [];

  /**
   * データを JSON 文字列にし、サイズ超過時は stack をトリミングする。
   * @param {Object} data 送信対象データ
   * @returns {string} JSON 文字列
   */
  function serialize(data) {
    let json = JSON.stringify(data);
    if (json.length > MAX_PAYLOAD && data.stack) {
      data.stack = data.stack.slice(0, MAX_STACK);
      json = JSON.stringify(data);
    }
    return json;
  }

  /**
   * Beacon での送信を試み、失敗時は fetch を使ってログを送信する。
   * @param {Object} data 送信対象データ
   */
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

  /**
   * 1 秒あたり最大 5 件までに制限してログを送信する。
   * @param {Object} data 送信対象データ
   */
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

  // window の error イベントを監視して送信
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

  // 未処理の Promise rejection を監視して送信
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

  // console.log / warn / error をラップして送信
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

