package com.picscore.backend.arena.service.impl;

import com.picscore.backend.arena.model.ArenaPhotoResponse;
import com.picscore.backend.arena.model.ArenaRankingResponse;
import com.picscore.backend.arena.model.entity.Arena;
import com.picscore.backend.arena.repository.ArenaRepository;
import com.picscore.backend.arena.service.ArenaService;
import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.common.utill.GameWeekUtil;
import com.picscore.backend.photo.repository.PhotoRepository;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 아레나 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class ArenaServiceImpl implements ArenaService {

    final private PhotoRepository photoRepository;
    final private ArenaRepository arenaRepository;
    final private UserRepository userRepository;

    final private GameWeekUtil gameWeekUtil;


    /**
     * 랜덤한 사진 4장을 가져오는 메서드
     *
     * @return 사진 정보와 정답 데이터를 포함한 응답 맵
     */
    @Override
    @Transactional
    public Map<String, Object> randomPhotos (
    ) {

        Map<String, Object> response = new HashMap<>();
        // 랜덤이미지 4장
        // is_public=true, score 일치X
        List<Object[]> photos = photoRepository.getRandomPublicPhotos();

        if (photos.size() < 4) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "조건에 맞는 사진이 충분하지 않습니다.");
        }

        List<Long> answer = photos.stream()
                .map(photo -> new ArenaPhotoResponse(
                        ((Number) photo[0]).longValue(),  // photo_id
                        ((Number) photo[1]).intValue(),   // score
                        (String) photo[2]                 // image_url
                ))
                .sorted(Comparator.comparing(ArenaPhotoResponse::getScore).reversed()) // score 기준 내림차순 정렬
                .map(photo -> photo.getPhotoId()) // photo_id 추출
                .collect(Collectors.toList());
        response.put("answer",answer);
        response.put("photos", photos);
        return response;
    }


    /**
     * Arena 점수를 계산하고 사용자 경험치를 업데이트하는 메서드
     *
     * @param userId 사용자 ID
     * @param correct 맞춘 정답 개수
     * @param time 문제를 푼 시간
     * @return 계산된 경험치
     */
    @Override
    public Integer calculateArena(
            Long userId, int correct, String time) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("유저를 찾을 수 없습니다. ID: " + userId));

        String activityWeek = gameWeekUtil.getCurrentGameWeek();

        float Ftime = 20f;
        Ftime = Float.parseFloat(time);
        final float adjustedTime = Ftime / 18f;

        Arena arena = arenaRepository.findByUserId(userId)
                .map(existingArena -> {
                    // 📅 주차(activityWeek)가 다르면 초기화
                    if (!existingArena.getActivityWeek().equals(activityWeek)) {
                        existingArena.resetForNewWeek(activityWeek);
                    }
                    return existingArena;
                })
                .orElseGet(() -> {
                    // 🌱 Arena가 없으면 새로 생성
                    Arena newArena = new Arena(user, 0, activityWeek);
                    return arenaRepository.save(newArena);
                });

        // 📊 경험치 계산
        int exp = correct * 100;

        // ✅ 정답이 4개라면 점수 증가
        if (correct == 4) {
            // 📊 경험치 계산
            exp += (int)(adjustedTime * 100);
            arena.increaseScore();
        }

        int experience = userRepository.findExperienceByUserId(userId);
        int plusExperience = experience + exp;
        user.updateExperience(plusExperience);
        user.updateLevel(plusExperience);
        userRepository.save(user);

        return exp;
    }


    /**
     * Arena 랭킹 정보를 페이지별로 조회하는 메서드
     *
     * @param pageNum 조회할 페이지 번호 (1부터 시작)
     * @return 랭킹 데이터를 포함한 응답 맵
     */
    @Override
    @Transactional
    public Map<String, Object> getArenaRanking(
            int pageNum) {

        String activityWeek = gameWeekUtil.getCurrentGameWeek();

        // pageNum이 1보다 작은 경우 예외 처리
        if (pageNum < 1) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상의 값이어야 합니다.");
        }

        // 페이지 요청 객체 생성 (페이지당 5개 항목)
        PageRequest pageRequest = PageRequest.of(pageNum-1, 5);

        // 레포지토리에서 사용자별 최고 점수 조회
        Page<Arena> arenaPage = arenaRepository.getHighestScoresPerUser(activityWeek, pageRequest);

        // 페이지 데이터 존재 여부 확인
        if (pageNum > arenaPage.getTotalPages() || arenaPage.getContent().isEmpty()) {
            throw new CustomException(HttpStatus.NOT_FOUND, "해당 페이지에 랭킹 정보가 없습니다");
        }

        List<ArenaRankingResponse> rankingResponses = new ArrayList<>();

        // 조회된 arena 데이터를 GetRankingResponse 객체로 변환
        for (int i = 0; i < arenaPage.getContent().size(); i++) {
            Arena arena = arenaPage.getContent().get(i);

            rankingResponses.add(new ArenaRankingResponse(
                    arena.getUser().getId(),
                    arena.getUser().getNickName(),
                    arena.getUser().getProfileImage(),
                    arena.getScore()
            ));
        }

        // 응답 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("totalPage", arenaPage.getTotalPages());
        responseData.put("ranking", rankingResponses);

        // 성공 응답 반환
        return responseData;
    }
}
