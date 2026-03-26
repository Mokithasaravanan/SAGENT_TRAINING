package com.ngo.donation.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Lenient LocalDateTime deserializer to accept common ISO strings
 * with or without seconds, using 'T' or space between date/time.
 */
public class LenientLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter[] FORMATTERS = new DateTimeFormatter[] {
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,                 // 2026-03-22T07:30:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),     // 2026-03-22T07:30
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),    // 2026-03-22 07:30:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")        // 2026-03-22 07:30
    };

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.isBlank()) {
            return null;
        }
        String v = value.trim();
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(v, formatter);
            } catch (Exception ignored) {
                // try next formatter
            }
        }
        // Try appending seconds if missing (e.g. 2026-03-22T07:30)
        if (v.matches("^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}$")) {
            try {
                String withSeconds = v + ":00";
                DateTimeFormatter fmt = v.contains("T")
                        ? DateTimeFormatter.ISO_LOCAL_DATE_TIME
                        : DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                return LocalDateTime.parse(withSeconds, fmt);
            } catch (Exception ignored) {
                // fall through
            }
        }
        throw new IOException("Invalid datetime format: " + v);
    }
}
