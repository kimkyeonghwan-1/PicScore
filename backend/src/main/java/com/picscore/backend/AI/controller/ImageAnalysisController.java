package com.picscore.backend.AI.controller;

import com.picscore.backend.AI.service.LavaImageService;
import com.picscore.backend.AI.service.OpenAiImageService;
import com.picscore.backend.common.model.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * 이미지 분석 요청을 처리하는 컨트롤러입니다.
 * 현재 Lava API를 통해 이미지를 분석합니다.
 */
@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageAnalysisController {

    private final OpenAiImageService openAiImageService;
    private final LavaImageService lavaImageService;

    /**
     * 전달받은 이미지 URL을 분석하여 결과를 반환합니다.
     *
     * @param imageUrl 분석할 이미지의 URL
     * @return 분석 결과를 담은 응답 객체 (Lava 기준: {@code Map<String, Object>})
     * @throws IOException 이미지 처리 중 발생할 수 있는 예외
     *
     * 예시 요청: GET /api/v1/image/analyze?imageUrl=https://example.com/image.jpg
     */
    @GetMapping("/analyze")
    public ResponseEntity<BaseResponse<Map<String, Object>>> analyze(
            @RequestParam String imageUrl) throws IOException {

        // GPT API 호출
         return openAiImageService.analyzeImage(imageUrl, 0);

        // Lava API 분석 결과 반환
//        return lavaImageService.analyzeImage(imageUrl);
    }
}



