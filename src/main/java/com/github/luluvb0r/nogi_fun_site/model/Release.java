package com.github.luluvb0r.nogi_fun_site.model;

import java.time.LocalDate;
import java.util.List;

/**
 * 乃木坂46のリリース作品（シングル/アルバム）を表すレコード。
 *
 * @param category    リリースの種類（Single または Album）
 * @param number      シングルのリリース番号。アルバムの場合は 0
 * @param title       作品タイトル
 * @param releaseDate 発売日
 * @param songs       収録曲のリスト
 */
public record Release(String category, int number, String title, LocalDate releaseDate, List<String> songs) {}
