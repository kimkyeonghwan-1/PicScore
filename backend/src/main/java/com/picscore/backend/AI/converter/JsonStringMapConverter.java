package com.picscore.backend.AI.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.HashMap;
import java.util.Map;

/**
 * {@link Map<String, String>} 타입을 JSON 문자열로 변환하여
 * 데이터베이스에 저장하고, 다시 Java 객체로 역변환하는 JPA 컨버터입니다.
 *
 * {@code autoApply = true}로 설정되어 있어, {@code Map<String, String>} 타입 필드에 자동 적용됩니다.
 *
 * 예: {"k1": "v1", "k2": "v2"} 와 같은 형태로 DB에 저장됩니다.
 */
@Converter(autoApply = true)
public class JsonStringMapConverter implements AttributeConverter<Map<String, String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();


    /**
     * {@code Map<String, String>} 객체를 JSON 문자열로 변환합니다.
     *
     * @param attribute 변환할 Map 객체
     * @return JSON 문자열
     * @throws RuntimeException 변환 중 예외 발생 시
     */
    @Override
    public String convertToDatabaseColumn(
            Map<String, String> attribute) {

        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("JSON 변환 오류: " + e.getMessage(), e);
        }
    }


    /**
     * DB에 저장된 JSON 문자열을 {@code Map<String, String>} 객체로 역변환합니다.
     *
     * @param dbData 데이터베이스에 저장된 JSON 문자열
     * @return Map 객체
     * @throws RuntimeException 역변환 중 예외 발생 시
     */
    @Override
    public Map<String, String> convertToEntityAttribute(
            String dbData) {

        try {
            if (dbData == null || dbData.isEmpty()) {
                return new HashMap<>();
            }
            return objectMapper.readValue(dbData, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("JSON 역변환 오류: " + e.getMessage(), e);
        }
    }
}




