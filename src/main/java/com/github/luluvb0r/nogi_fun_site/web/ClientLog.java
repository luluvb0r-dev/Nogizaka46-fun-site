package com.github.luluvb0r.nogi_fun_site.web;

/**
 * ブラウザから送信されるクライアントログのDTO。
 */
public record ClientLog(
        String type,
        String level,
        String message,
        String filename,
        Integer lineno,
        Integer colno,
        String stack,
        String url,
        String userAgent,
        String time
) {}
