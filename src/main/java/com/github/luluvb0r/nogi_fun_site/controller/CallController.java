package com.github.luluvb0r.nogi_fun_site.controller;

import com.github.luluvb0r.nogi_fun_site.model.Single;
import com.github.luluvb0r.nogi_fun_site.repository.SingleRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@Controller
public class CallController {

    @GetMapping("/calls")
    public String calls(Model model) {
        model.addAttribute("singles", SingleRepository.findAll());
        return "calls";
    }

    @GetMapping("/calls/{number}")
    public String songs(@PathVariable int number, Model model) {
        Single single = SingleRepository.findByNumber(number);
        if (single == null) {
            return "redirect:/calls";
        }
        model.addAttribute("single", single);
        return "songs";
    }
}
