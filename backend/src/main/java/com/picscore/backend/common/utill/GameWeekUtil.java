package com.picscore.backend.common.utill;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;

@Component
public class GameWeekUtil {

    public String getCurrentGameWeek() {
        LocalDate now = LocalDate.now(ZoneId.of("UTC"));
        int year = now.getYear();
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return String.format("%d%02d", year, week);
    }
}
