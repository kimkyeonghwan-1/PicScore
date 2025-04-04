package com.picscore.backend.arena.service;

import com.picscore.backend.arena.model.ArenaPhotoResponse;
import com.picscore.backend.arena.model.entity.Arena;
import com.picscore.backend.arena.repository.ArenaRepository;
import com.picscore.backend.photo.repository.PhotoRepository;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArenaService {

    final private PhotoRepository photoRepository;
    final private ArenaRepository arenaRepository;
    final private UserRepository userRepository;
    @Transactional
    public Map<String, Object> randomPhotos () {
        Map<String, Object> response = new HashMap<>();
        // 랜덤이미지 4장
        // is_public=true, score 일치X
        List<Object[]> photos = photoRepository.getRandomPublicPhotos();

        if (photos.size() < 4) {
            throw new IllegalStateException("조건에 맞는 사진이 충분하지 않습니다.");
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

    public Integer calculateArena(Long userId, int correct, String time) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("유저를 찾을 수 없습니다. ID: " + userId));
        String activityWeek = getCurrentGameWeek();
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
    // ✅ 현재 주차의 게임 ID 가져오기
    public String getCurrentGameWeek() {
        LocalDate now = LocalDate.now(ZoneId.of("UTC"));
        int year = now.getYear();
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return String.format("%d%02d", year, week);
    }
}
