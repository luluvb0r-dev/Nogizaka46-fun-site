package com.github.luluvb0r.nogi_fun_site.repository;

import com.github.luluvb0r.nogi_fun_site.model.Single;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * クラスパス上のCSVリソースから乃木坂46のシングル一覧を読み込むリポジトリ。
 * データは高速に参照できるようメモリ上に保持される。
 */
public class SingleRepository {
    // クラス初期化時に一度だけシングルを読み込む
    private static final Logger log = LoggerFactory.getLogger(SingleRepository.class);
    private static final List<Single> SINGLES = loadSingles();

    /**
     * {@code singles.csv} からシングルデータを読み込む。
     *
     * @return CSVから解析された {@link Single} のリスト
     */
    private static List<Single> loadSingles() {
        log.debug("Loading singles from CSV");
        try (InputStream is = SingleRepository.class.getResourceAsStream("/singles.csv");
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            Map<String, TempSingle> map = new LinkedHashMap<>();
            // ヘッダーを読み飛ばし、各行を処理する
            reader.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                // 行がシングルを表していない場合は無視する
                if (parts.length < 4 || !"Single".equals(parts[0])) {
                    return;
                }
                int number = parseNumber(parts[1]);
                String title = parts[2];
                String song = parts[3];
                String key = parts[1] + "|" + title;
                // 同じシングルの曲をまとめる
                map.computeIfAbsent(key, k -> new TempSingle(number, title))
                        .songs.add(song);
            });
            List<Single> result = new ArrayList<>();
            map.values().forEach(ts -> result.add(new Single(ts.number, ts.title, List.copyOf(ts.songs))));
            log.debug("Loaded {} singles", result.size());
            return result;
        } catch (Exception e) {
            // 読み込みに失敗した場合は空のリストを返す。呼び出し側でデータ不足を扱えるようにする
            log.error("Failed to load singles", e);
            return List.of();
        }
    }

    /**
     * "1st" や "2nd" のようなリリース番号を整数に変換する。
     *
     * @param releaseNumber リリース番号の文字列表現
     * @return 数値のリリース番号
     */
    private static int parseNumber(String releaseNumber) {
        return Integer.parseInt(releaseNumber.replaceAll("\\D", ""));
    }

    /**
     * CSV解析中に使用する一時的な可変シングル。
     */
    private record TempSingle(int number, String title, List<String> songs) {
        TempSingle(int number, String title) {
            this(number, title, new ArrayList<>());
        }
    }

    /**
     * CSVから読み込んだすべてのシングルを返す。
     *
     * @return 変更不可のシングル一覧
     */
    public static List<Single> findAll() {
        return SINGLES;
    }

    /**
     * リリース番号でシングルを検索する。
     *
     * @param number 検索するリリース番号
     * @return 見つかったシングル。存在しない場合は {@code null}
     */
    public static Single findByNumber(int number) {
        log.debug("Searching for single number {}", number);
        return SINGLES.stream()
                .filter(s -> s.number() == number)
                .findFirst()
                .orElse(null);
    }
}
