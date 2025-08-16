package com.github.luluvb0r.nogi_fun_site.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
/**
 * アプリケーションのホームページへのリクエストを処理するコントローラ。
 */
public class HomeController {

    private static final Logger log = LoggerFactory.getLogger(HomeController.class);

    /**
     * トップページを表示する。
     *
     * @return ホームページのビュー名
     */
    @GetMapping("/")
    public String home() {
        log.debug("Rendering home page");
        return "index";
    }
}
