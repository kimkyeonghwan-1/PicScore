package com.picscore.backend.arena.controller;

import com.picscore.backend.arena.model.ResultArenaRequest;
import com.picscore.backend.arena.service.ArenaService;
import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 아레나 관련 요청을 처리하는 REST 컨트롤러 클래스
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v2/arena")
public class ArenaController {

    private final ArenaService arenaService;
    private final OAuthService oAuthService;


    /**
     * 랜덤한 사진들을 추출하여 반환하는 API
     *
     * @return ResponseEntity<BaseResponse<Map<String,Object>>> 랜덤으로 추출된 사진 정보를 포함한 응답
     */
    @GetMapping("/random")
    public ResponseEntity<BaseResponse<Map<String,Object>>> getRandomPhotos (
    ) {
        return ResponseEntity.ok(BaseResponse.success("추출완료", arenaService.randomPhotos()));
    }


    /**
     * 아레나 게임 결과를 처리하는 API
     *
     * @param request 사용자 식별을 위한 HttpServletRequest 객체
     * @param payload 게임 결과 데이터 (정답 여부 및 시간 등)를 담은 요청 바디
     * @return ResponseEntity<BaseResponse<Integer>> 게임 결과 처리 후의 점수 혹은 결과 데이터를 담은 응답
     */
    @PostMapping("/result")
    public ResponseEntity<BaseResponse<Integer>> arenaResult (
            HttpServletRequest request,
            @RequestBody ResultArenaRequest payload) {

        // 사용자 닉네임으로부터 userId 추출
        Long userId = oAuthService.findIdByNickName(request);

        // 테스트용 코드: userId가 null인 경우 임시 ID로 대체
        if (userId == null) {
            userId = Long.valueOf(1); // 테스트용
            // throw new IllegalArgumentException("userId가 null입니다.");
        }

        // 아레나 결과 계산 및 응답 반환
        return ResponseEntity.ok(BaseResponse.success("게임 완료",
                arenaService.calculateArena(userId, payload.getCorrect(), payload.getTime())));
    }


    /**
     * 아레나 랭킹 정보를 페이지 단위로 조회하는 API
     *
     * @param pageNum 조회할 페이지 번호
     * @return ResponseEntity<BaseResponse<Map<String, Object>>> 랭킹 정보를 포함한 응답
     */
    @GetMapping("/{pageNum}")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getArenaRanking(
            @PathVariable int pageNum) {

        // 아레나 랭킹 조회
        Map<String, Object> reponse = arenaService.getArenaRanking(pageNum);

        // 성공 응답 반환
        return ResponseEntity.ok(BaseResponse.success("랭킹 전체 목록 조회 성공", reponse));
    }
}
