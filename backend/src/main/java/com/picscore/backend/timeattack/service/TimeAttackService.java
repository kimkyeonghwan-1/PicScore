package com.picscore.backend.timeattack.service;

import com.picscore.backend.timeattack.model.request.*;
import com.picscore.backend.timeattack.model.response.*;

import java.io.IOException;
import java.util.Map;

/**
 * 타임어택(TimeAttack) 관련 기능을 정의한 인터페이스입니다.
 * 구현체는 TimeAttackService 입니다.
 */
public interface TimeAttackService {


    /**
     * 주간 랭킹 정보를 페이지 단위로 조회합니다.
     */
    Map<String, Object> getRanking(int pageNum);


    /**
     * 업로드한 이미지를 분석하여 주제와의 일치 여부를 평가합니다.
     */
    AnalysisPhotoResponse analysisPhoto(AnalysisPhotoRequest request) throws IOException;


    /**
     * 타임어택 게임의 결과(사진, 점수 등)를 저장합니다.
     */
    void saveTimeAttack(Long userId, SaveTimeAttackRequest request);
}
