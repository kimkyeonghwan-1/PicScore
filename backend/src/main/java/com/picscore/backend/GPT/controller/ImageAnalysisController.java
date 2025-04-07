package com.picscore.backend.GPT.controller;

import com.picscore.backend.GPT.service.OpenAiImageService;
import com.picscore.backend.common.model.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageAnalysisController {

    private final OpenAiImageService openAiImageService;

    @GetMapping("/analyze")
    public ResponseEntity<BaseResponse<Map<String, Object>>> analyze(
            @RequestParam String imageUrl) throws IOException {
        return openAiImageService.analyzeImage(imageUrl, 0);
    }
}


