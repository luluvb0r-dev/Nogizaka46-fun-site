package com.github.luluvb0r.nogi_fun_site.model;

import java.util.List;

/**
 * 乃木坂46のシングルを表すレコード。
 *
 * @param number 何枚目のシングルかを示す番号
 * @param name   シングルのタイトル
 * @param songs  収録曲のリスト
 */
public record Single(int number, String name, List<String> songs) {}
