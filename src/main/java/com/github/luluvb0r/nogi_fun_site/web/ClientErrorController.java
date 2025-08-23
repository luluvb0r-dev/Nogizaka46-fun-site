package com.github.luluvb0r.nogi_fun_site.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ブラウザから送信されるエラーログを受け取るコントローラ。
 */
@RestController
@RequestMapping("/client-errors")
public class ClientErrorController {

    private static final Logger log = LoggerFactory.getLogger(ClientErrorController.class);

    /**
     * クライアント側のログを受信してサーバログへ出力する。
     *
     * @param clientLog クライアントログ
     * @return 204 No Content
     */
    @PostMapping
    public ResponseEntity<Void> receive(@RequestBody(required = false) ClientLog clientLog) {
        if (clientLog == null) {
            return ResponseEntity.noContent().build();
        }

        String message = String.format(
                "ClientJS [type=%s level=%s] %s at %s:%s:%s url=%s ua=%s",
                clientLog.type(),
                clientLog.level(),
                clientLog.message(),
                clientLog.filename(),
                clientLog.lineno(),
                clientLog.colno(),
                clientLog.url(),
                clientLog.userAgent()
        );

        String stack = clientLog.stack();
        String logText = stack != null ? message + "\n" + stack : message;

        if ("console".equals(clientLog.type())) {
            logConsole(clientLog.level(), logText);
        } else {
            logError(clientLog.level(), logText);
        }
        return ResponseEntity.noContent().build();
    }

    private void logConsole(String level, String text) {
        if ("error".equalsIgnoreCase(level)) {
            log.error(text);
            return;
        }
        if ("warn".equalsIgnoreCase(level)) {
            log.warn(text);
            return;
        }
        log.info(text);
    }

    private void logError(String level, String text) {
        if ("error".equalsIgnoreCase(level)) {
            log.error(text);
            return;
        }
        log.warn(text);
    }
}
