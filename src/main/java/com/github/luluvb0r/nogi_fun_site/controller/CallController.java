package com.github.luluvb0r.nogi_fun_site.controller;

import com.github.luluvb0r.nogi_fun_site.model.Single;
import com.github.luluvb0r.nogi_fun_site.repository.SingleRepository;
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
 * シングルとその収録曲を表示するコントローラ。
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
        log.debug("Listing all singles");
        model.addAttribute("singles", SingleRepository.findAll());
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
        Single single = SingleRepository.findByNumber(number);
        if (single == null) {
            // 番号が存在しない場合はシングル一覧にリダイレクト
            log.debug("Single {} not found, redirecting to list", number);
            return "redirect:/calls";
        }
        model.addAttribute("single", single);
        return "songs";
    }

    /**
     * 指定されたシングル内の曲詳細を表示する。
     *
     * @param number シングルの番号
     * @param index  曲のインデックス(0始まり)
     * @param model  曲データを格納するモデル
     * @return 曲詳細ページのビュー名。不明な場合は曲一覧へリダイレクト
     */
    @GetMapping("/calls/{number}/songs/{index}")
    public String songDetail(@PathVariable int number, @PathVariable int index, Model model) {
        log.debug("Showing detail for song {} of single {}", index, number);
        Single single = SingleRepository.findByNumber(number);
        if (single == null || index < 0 || index >= single.songs().size()) {
            log.debug("Song {} of single {} not found, redirecting", index, number);
            return "redirect:/calls/" + number;
        }
        String song = single.songs().get(index);
        model.addAttribute("single", single);
        model.addAttribute("song", song);
        return "song";
    }

    /**
     * JSON形式でシングル一覧を返す。
     *
     * @return シングルのリスト
     */
    @GetMapping("/api/singles")
    @ResponseBody
    public List<Single> singles() {
        log.debug("Providing singles as JSON");
        return SingleRepository.findAll();
    }
}
