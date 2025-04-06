package com.picscore.backend.common.utill;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;

public class GameWeekUtil {

    public static String getCurrentGameWeek() {
        LocalDate now = LocalDate.now(ZoneId.of("UTC"));
        int year = now.getYear();
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return String.format("%d%02d", year, week);
    }
}
