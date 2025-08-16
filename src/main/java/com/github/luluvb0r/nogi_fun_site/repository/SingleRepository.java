package com.github.luluvb0r.nogi_fun_site.repository;

import com.github.luluvb0r.nogi_fun_site.model.Single;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SingleRepository {
    private static final List<Single> SINGLES = loadSingles();

    private static List<Single> loadSingles() {
        try (InputStream is = SingleRepository.class.getResourceAsStream("/singles.csv");
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            Map<String, TempSingle> map = new LinkedHashMap<>();
            reader.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                if (parts.length < 4 || !"Single".equals(parts[0])) {
                    return;
                }
                int number = parseNumber(parts[1]);
                String title = parts[2];
                String song = parts[3];
                String key = parts[1] + "|" + title;
                map.computeIfAbsent(key, k -> new TempSingle(number, title))
                        .songs.add(song);
            });
            List<Single> result = new ArrayList<>();
            map.values().forEach(ts -> result.add(new Single(ts.number, ts.title, List.copyOf(ts.songs))));
            return result;
        } catch (Exception e) {
            return List.of();
        }
    }

    private static int parseNumber(String releaseNumber) {
        return Integer.parseInt(releaseNumber.replaceAll("\\D", ""));
    }

    private record TempSingle(int number, String title, List<String> songs) {
        TempSingle(int number, String title) {
            this(number, title, new ArrayList<>());
        }
    }

    public static List<Single> findAll() {
        return SINGLES;
    }

    public static Single findByNumber(int number) {
        return SINGLES.stream()
                .filter(s -> s.number() == number)
                .findFirst()
                .orElse(null);
    }
}
