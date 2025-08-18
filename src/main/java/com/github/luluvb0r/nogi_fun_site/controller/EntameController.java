package com.github.luluvb0r.nogi_fun_site.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 円タメグラフ関連の画面を表示するコントローラ。
 */
@Controller
public class EntameController {

    private static final Logger log = LoggerFactory.getLogger(EntameController.class);

    /**
     * 円タメグラフのページを表示する。
     *
     * @return ページのビュー名
     */
    @GetMapping("/entame")
    public String entame() {
        log.debug("Rendering entertainment pie chart page");
        return "entame";
    }
}
