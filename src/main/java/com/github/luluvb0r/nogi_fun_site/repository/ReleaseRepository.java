package com.github.luluvb0r.nogi_fun_site.repository;

import com.github.luluvb0r.nogi_fun_site.model.Release;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * クラスパス上のCSVリソースから乃木坂46のリリース作品を読み込むリポジトリ。
 * シングル/アルバムを区別せずに扱い、発売日順にソートされたリストを提供する。
 */
public class ReleaseRepository {
    private static final Logger log = LoggerFactory.getLogger(ReleaseRepository.class);
    private static final List<Release> RELEASES = loadReleases();

    /**
     * {@code singles.csv} からリリースデータを読み込む。
     *
     * @return CSVから解析された {@link Release} のリスト
     */
    private static List<Release> loadReleases() {
        log.debug("Loading releases from CSV");
        try (InputStream is = ReleaseRepository.class.getResourceAsStream("/singles.csv");
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            Map<String, TempRelease> map = new LinkedHashMap<>();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy/M/d");
            // ヘッダーを読み飛ばし、各行を処理する
            reader.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                if (parts.length < 5) {
                    return;
                }
                String category = parts[0];
                String releaseNumber = parts[1];
                String title = parts[2];
                String song = parts[3];
                LocalDate date = LocalDate.parse(parts[4], fmt);
                int number = parseNumber(releaseNumber);
                String key = category + "|" + releaseNumber + "|" + title;
                map.computeIfAbsent(key, k -> new TempRelease(category, number, title, date))
                        .songs.add(song);
            });
            List<Release> result = new ArrayList<>();
            map.values().forEach(tr -> result.add(new Release(tr.category, tr.number, tr.title, tr.releaseDate, List.copyOf(tr.songs))));
            result.sort(Comparator.comparing(Release::releaseDate));
            log.debug("Loaded {} releases", result.size());
            return result;
        } catch (Exception e) {
            log.error("Failed to load releases", e);
            return List.of();
        }
    }

    /**
     * "1st" や "2nd" のようなリリース番号を整数に変換する。
     *
     * @param releaseNumber リリース番号の文字列表現
     * @return 数値のリリース番号。数字が無い場合は 0
     */
    private static int parseNumber(String releaseNumber) {
        String digits = releaseNumber == null ? "" : releaseNumber.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return 0;
        }
        return Integer.parseInt(digits);
    }

    /**
     * CSV解析中に使用する一時的な可変リリース。
     */
    private record TempRelease(String category, int number, String title, LocalDate releaseDate, List<String> songs) {
        TempRelease(String category, int number, String title, LocalDate releaseDate) {
            this(category, number, title, releaseDate, new ArrayList<>());
        }
    }

    /**
     * 読み込んだすべてのリリース作品を返す。
     *
     * @return 変更不可のリリース一覧
     */
    public static List<Release> findAll() {
        return RELEASES;
    }

    /**
     * シングルのみを返す。
     *
     * @return シングルのリスト
     */
    public static List<Release> findSingles() {
        return RELEASES.stream()
                .filter(r -> "Single".equals(r.category()))
                .toList();
    }

    /**
     * リリース番号でシングルを検索する。
     *
     * @param number 検索するリリース番号
     * @return 見つかったシングル。存在しない場合は {@code null}
     */
    public static Release findSingleByNumber(int number) {
        log.debug("Searching for single number {}", number);
        return RELEASES.stream()
                .filter(r -> "Single".equals(r.category()) && r.number() == number)
                .findFirst()
                .orElse(null);
    }
}
