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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v2/arena")
public class ArenaController {

    final private ArenaService arenaService;
    final private OAuthService oAuthService;
    @GetMapping("/random")
    public ResponseEntity<BaseResponse<Map<String,Object>>> getRandomPhotos () {
        return ResponseEntity.ok(BaseResponse.success("추출완료",arenaService.randomPhotos()));
    }

    @PostMapping("/result")
    public ResponseEntity<BaseResponse<Integer>> arenaResult (HttpServletRequest request,
                                                             @RequestBody ResultArenaRequest payload) {
        Long userId = oAuthService.findIdByNickName(request);
        if (userId == null) {
            userId = Long.valueOf(1); // 테스트용
//            throw new IllegalArgumentException("userId가 null입니다.");
        }
        return ResponseEntity.ok(BaseResponse.success("게임 완료",arenaService.calculateArena(userId, payload.getCorrect(), payload.getTime())));
    }

    @GetMapping("/{pageNum}")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getArenaRanking(
            @PathVariable int pageNum) {

        Map<String, Object> reponse = arenaService.getArenaRanking(pageNum);

        return ResponseEntity.ok(BaseResponse.success("랭킹 전체 목록 조회 성공", reponse));
    }

}
