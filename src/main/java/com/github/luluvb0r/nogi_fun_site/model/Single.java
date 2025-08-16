package com.github.luluvb0r.nogi_fun_site.model;

import java.util.List;

/**
 * Represents a Nogizaka46 single.
 *
 * @param number release number (e.g., 1 for 1st single)
 * @param name   title of the single
 * @param songs  list of songs included in the single
 */
public record Single(int number, String name, List<String> songs) {}
