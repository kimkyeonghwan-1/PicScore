package com.picscore.backend.AI.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * {@link Map<String, Integer>} 타입을 JSON 문자열로 변환하여
 * 데이터베이스에 저장하고 다시 변환하는 JPA 컨버터입니다.
 *
 * 해당 컨버터는 JPA Entity의 필드에 자동 적용되며,
 * JSON 형태로 저장되므로 복잡한 자료구조를 RDB에 쉽게 저장할 수 있습니다.
 *
 * 예: {"math": 85, "english": 92}
 */
@Converter(autoApply = true)
public class JsonMapConverter implements AttributeConverter<Map<String, Integer>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();


    /**
     * Entity의 {@code Map<String, Integer>} 필드를 DB에 저장할 문자열(JSON)로 변환합니다.
     *
     * @param attribute 변환할 Map 객체
     * @return JSON 문자열로 변환된 값, 또는 빈 JSON ("{}") 문자열
     */
    @Override
    public String convertToDatabaseColumn(
            Map<String, Integer> attribute) {

        if (attribute == null || attribute.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }


    /**
     * DB에서 읽어온 JSON 문자열을 {@code Map<String, Integer>} 객체로 변환합니다.
     *
     * @param dbData 데이터베이스에서 읽어온 JSON 문자열
     * @return 변환된 Map 객체, 또는 빈 Map
     */
    @Override
    public Map<String, Integer> convertToEntityAttribute(
            String dbData) {

        if (dbData == null || dbData.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }
}




