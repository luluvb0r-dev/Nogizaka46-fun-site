package com.github.luluvb0r.nogi_fun_site.controller;

import com.github.luluvb0r.nogi_fun_site.model.Single;
import com.github.luluvb0r.nogi_fun_site.repository.SingleRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@Controller
/**
 * Controller responsible for displaying singles and their song lists.
 */
public class CallController {

    /**
     * Shows the list of all available singles.
     *
     * @param model model to populate with single data
     * @return view name for the single list page
     */
    @GetMapping("/calls")
    public String calls(Model model) {
        model.addAttribute("singles", SingleRepository.findAll());
        return "calls";
    }

    /**
     * Shows the songs that belong to the requested single.
     *
     * @param number release number of the single
     * @param model  model to populate with song data
     * @return view name for the songs page or redirect to the list if unknown
     */
    @GetMapping("/calls/{number}")
    public String songs(@PathVariable int number, Model model) {
        Single single = SingleRepository.findByNumber(number);
        if (single == null) {
            // Redirect back to the single list when the number is invalid
            return "redirect:/calls";
        }
        model.addAttribute("single", single);
        return "songs";
    }
}
