package com.github.luluvb0r.nogi_fun_site.controller;

import com.github.luluvb0r.nogi_fun_site.model.Release;
import com.github.luluvb0r.nogi_fun_site.repository.ReleaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;


@Controller
/**
 * シングル/アルバムとその収録曲を表示するコントローラ。
 */
public class CallController {

    private static final Logger log = LoggerFactory.getLogger(CallController.class);

    /**
     * すべてのシングル一覧を表示する。
     *
     * @param model シングルデータを格納するモデル
     * @return シングル一覧ページのビュー名
     */
    @GetMapping("/calls")
    public String calls(Model model) {
        List<Release> releases = ReleaseRepository.findSingles();
        log.debug("Listing all singles, count={}", releases.size());
        model.addAttribute("releases", releases);
        return "calls";
    }

    /**
     * 指定されたシングルの曲を表示する。
     *
     * @param number シングルの番号
     * @param model  曲データを格納するモデル
     * @return 曲一覧ページのビュー名。不明な場合は一覧へリダイレクト
     */
    @GetMapping("/calls/{number}")
    public String songs(@PathVariable int number, Model model) {
        log.debug("Showing songs for single {}", number);
        Release release = ReleaseRepository.findSingleByNumber(number);
        if (release == null) {
            // 番号が存在しない場合はシングル一覧にリダイレクト
            log.debug("Single {} not found, redirecting to list", number);
            return "redirect:/calls";
        }
        log.debug("Single {} has {} songs", number, release.songs().size());
        model.addAttribute("release", release);
        return "songs";
    }

    /**
     * JSON形式でリリース一覧を返す。
     *
     * @return リリースのリスト
     */
    @GetMapping("/api/releases")
    @ResponseBody
    public List<Release> releases() {
        List<Release> releases = ReleaseRepository.findAll();
        log.debug("Providing {} releases as JSON", releases.size());
        return releases;
    }

    /**
     * 曲の詳細ページを表示する。
     *
     * @param title 曲名
     * @param model モデル
     * @return 曲詳細ページのビュー名
     */
    @GetMapping("/song/{title}")
    public String songDetail(@PathVariable String title, Model model) {
        log.debug("Showing detail for song {}", title);
        model.addAttribute("title", title);
        return "song-detail";
    }
}
