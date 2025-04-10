package com.picscore.backend.common.utill;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;

@Component
public class GameWeekUtil {


    /**
     * 현재 날짜 기준으로 게임 주차(yyyyWW 형식)를 반환
     * 예: 2025년 14번째 주 → "202514"
     */
    public String getCurrentGameWeek() {
        // UTC 기준 현재 날짜 구하기
        LocalDate now = LocalDate.now(ZoneId.of("UTC"));

        // 현재 연도 추출
        int year = now.getYear();

        // ISO 기준으로 주차 추출 (한 해는 최대 53주)
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);

        // 예: 2025년 14주차 → "202514"
        return String.format("%d%02d", year, week);
    }
}

