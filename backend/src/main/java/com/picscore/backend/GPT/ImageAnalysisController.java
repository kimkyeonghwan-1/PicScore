package com.picscore.backend.GPT;

import com.picscore.backend.common.model.response.BaseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/image")
public class ImageAnalysisController {

    private final OpenAiImageService openAiImageService;

    public ImageAnalysisController(OpenAiImageService openAiImageService) {
        this.openAiImageService = openAiImageService;
    }

    @GetMapping("/analyze")
    public ResponseEntity<BaseResponse<Map<String, Object>>> analyze(@RequestParam String imageUrl)
            throws IOException {
        return openAiImageService.analyzeImage(imageUrl, 0);
    }
}


