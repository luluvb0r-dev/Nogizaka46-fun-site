package com.github.luluvb0r.nogi_fun_site.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
/**
 * Handles requests for the application's home page.
 */
public class HomeController {

    /**
     * Displays the landing page.
     *
     * @return view name of the home page
     */
    @GetMapping("/")
    public String home() {
        return "index";
    }
}
