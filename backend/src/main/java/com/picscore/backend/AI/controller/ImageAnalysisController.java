package com.picscore.backend.AI.controller;

import com.picscore.backend.AI.service.LavaImageService;
import com.picscore.backend.AI.service.OpenAiImageService;
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
    private final LavaImageService lavaImageService;

    @GetMapping("/analyze")
    public ResponseEntity<BaseResponse<Map<String, Object>>> analyze(    // GPT: Map<String, Object>, LAVA: <String>
            @RequestParam String imageUrl) throws IOException {
//        return openAiImageService.analyzeImage(imageUrl, 0);    // GPT API
        return lavaImageService.analyzeImage(imageUrl);    // Lava API
    }
}


