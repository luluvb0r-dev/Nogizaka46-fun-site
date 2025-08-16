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

/**
 * Repository that loads all Nogizaka46 singles from a CSV resource on the classpath.
 * The data is kept in memory for quick lookups.
 */
public class SingleRepository {
    // Load the singles once when the class is initialized
    private static final List<Single> SINGLES = loadSingles();

    /**
     * Reads single data from the {@code singles.csv} file.
     *
     * @return list of {@link Single} objects parsed from the CSV
     */
    private static List<Single> loadSingles() {
        try (InputStream is = SingleRepository.class.getResourceAsStream("/singles.csv");
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            Map<String, TempSingle> map = new LinkedHashMap<>();
            // Skip header and process each CSV line
            reader.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                // Only handle lines that represent singles
                if (parts.length < 4 || !"Single".equals(parts[0])) {
                    return;
                }
                int number = parseNumber(parts[1]);
                String title = parts[2];
                String song = parts[3];
                String key = parts[1] + "|" + title;
                // Accumulate songs under the same single
                map.computeIfAbsent(key, k -> new TempSingle(number, title))
                        .songs.add(song);
            });
            List<Single> result = new ArrayList<>();
            map.values().forEach(ts -> result.add(new Single(ts.number, ts.title, List.copyOf(ts.songs))));
            return result;
        } catch (Exception e) {
            // Return an empty list if loading fails; callers can handle missing data
            return List.of();
        }
    }

    /**
     * Converts a release number such as "1st" or "2nd" into an integer.
     *
     * @param releaseNumber string representation of the release number
     * @return numeric release number
     */
    private static int parseNumber(String releaseNumber) {
        return Integer.parseInt(releaseNumber.replaceAll("\\D", ""));
    }

    /**
     * Temporary mutable representation of a single used during CSV parsing.
     */
    private record TempSingle(int number, String title, List<String> songs) {
        TempSingle(int number, String title) {
            this(number, title, new ArrayList<>());
        }
    }

    /**
     * Returns all singles loaded from the CSV.
     *
     * @return immutable list of singles
     */
    public static List<Single> findAll() {
        return SINGLES;
    }

    /**
     * Finds a single by its release number.
     *
     * @param number release number to search for
     * @return matching single or {@code null} if not found
     */
    public static Single findByNumber(int number) {
        return SINGLES.stream()
                .filter(s -> s.number() == number)
                .findFirst()
                .orElse(null);
    }
}
