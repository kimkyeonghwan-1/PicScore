package com.picscore.backend.photo.controller;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.photo.model.request.GetPhotosRequest;
import com.picscore.backend.photo.model.request.SearchPhotoRequest;
import com.picscore.backend.photo.model.response.*;
import com.picscore.backend.photo.model.request.UploadPhotoRequest;
import com.picscore.backend.photo.service.PhotoService;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 사진 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final OAuthService oAuthService;


    // 임시저장
    @PostMapping("/photo")
    public ResponseEntity<BaseResponse<UploadPhotoResponse>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        return photoService.uploadFile(file);
    }


    /**
     * 새로운 사진을 업로드하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (사용자 인증 정보 포함)
     * @param payload 업로드할 사진 정보가 담긴 요청 객체
     * @return ResponseEntity<BaseResponse<HttpStatus>> 업로드 결과 응답
     */
    @PostMapping("/photo/save")
    public ResponseEntity<BaseResponse<SavePhotoResponse>> uploadFile(HttpServletRequest request,
                                                                      @RequestBody UploadPhotoRequest payload) {

        System.out.println("hashTag = " + payload.getHashTag());
        // 토큰에서 사용자 정보 추출
        Long userId = oAuthService.findIdByNickName(request);
        if (userId == null) {
            throw new IllegalArgumentException("userId가 null입니다.");
        }
        if (payload.getPhotoType() == null || payload.getPhotoType().trim().isEmpty()) {
            throw new IllegalArgumentException("photoType 값이 비어있습니다.");
        }
        return photoService.savePhoto(
                userId,
                payload.getImageName(),
                payload.getScore(),
                payload.getAnalysisChart(),
                payload.getAnalysisText(),
                payload.getIsPublic(),
                payload.getPhotoType(),
                payload.getHashTag()
        );
    }


    /**
     * 특정 해시태그로 사진을 검색하는 엔드포인트
     *
     * @param keyword 검색 요청 객체 (해시태그 키워드 포함)
     * @return ResponseEntity<BaseResponse<List<GetPhotosResponse>>> 검색된 사진 목록 응답
     */
    @GetMapping("/photo/search")
    public ResponseEntity<BaseResponse<List<GetPhotosResponse>>> searchPhotosByHashtag(@RequestParam String keyword) {
        return photoService.searchPhotosByHashtag(keyword);
    }


    /**
     * 특정 사진의 공개/비공개 설정을 토글하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (사용자 인증 정보 포함)
     * @param photoId 공개/비공개 설정을 변경할 사진 ID
     * @return ResponseEntity<BaseResponse<Void>> 설정 변경 결과 응답
     */
    @PatchMapping("/photo/{photoId}")
    public ResponseEntity<BaseResponse<Void>> togglePublic(HttpServletRequest request, @PathVariable Long photoId) {
        Long userId = oAuthService.findIdByNickName(request);
        return photoService.togglePublic(photoId, userId);
    }


    /**
     * 특정 사진을 삭제하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (사용자 인증 정보 포함)
     * @param photoId 삭제할 사진 ID
     * @return ResponseEntity<BaseResponse<Void>> 삭제 결과 응답
     */
    @DeleteMapping("/photo/{photoId}")
    public ResponseEntity<BaseResponse<Void>> deletePhoto(HttpServletRequest request, @PathVariable Long photoId) {
        Long userId = oAuthService.findIdByNickName(request);
        return photoService.deletePhoto(photoId, userId);
    }


    /**
     * 특정 사용자의 사진 목록을 조회하는 엔드포인트
     *
     * @param userId 조회할 사용자 ID
     * @param isPublic 공개 여부를 포함한 조회 요청 객체
     * @return ResponseEntity<BaseResponse<List<GetPhotosResponse>>> 사용자의 사진 목록 응답
     */
    @GetMapping("/user/photo/{userId}")
    public ResponseEntity<BaseResponse<List<GetPhotosResponse>>>
    getPhotosByUserId(
            @PathVariable Long userId, @RequestParam(required = false) Boolean isPublic) {

        List<GetPhotosResponse> getPhotosResponseList = photoService.getPhotosByUserId(userId, isPublic);

        return ResponseEntity.ok(BaseResponse.success("사진 조회 성공", getPhotosResponseList));
    }


    /**
     * 현재 사용자의 사진 목록을 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (사용자 인증 정보 포함)
     * @param isPublic 공개 여부를 포함한 조회 요청 객체
     * @return ResponseEntity<BaseResponse<List<GetPhotosResponse>>> 현재 사용자의 사진 목록 응답
     */
    @GetMapping("/user/photo/me")
    public ResponseEntity<BaseResponse<List<GetPhotosResponse>>>
    getMyPhotos(
            HttpServletRequest request, @RequestParam(required = false) Boolean isPublic) {

        Long userId = oAuthService.findIdByNickName(request);
        List<GetPhotosResponse> getPhotosResponseList = photoService.getPhotosByUserId(userId, isPublic);

        return ResponseEntity.ok(BaseResponse.success("사진 조회 성공", getPhotosResponseList));
    }


    /**
     * 특정 사진의 상세 정보를 조회하는 엔드포인트
     *
     * @param photoId 조회할 사진 ID
     * @return ResponseEntity<BaseResponse<GetPhotoDetailResponse>> 사진 상세 정보 응답
     */
    @GetMapping("/photo/{photoId}")
    public ResponseEntity<BaseResponse<GetPhotoDetailResponse>> getPhotoDetail(
            HttpServletRequest request, @PathVariable Long photoId) {

        Long userId = null; // 기본값 설정 (비회원)

        try {
            userId = oAuthService.findIdByNickName(request);
        } catch (Exception e) {
            System.out.printf("쿠키에서 userId 추출 실패: {}", e.getMessage()); // 예외 로깅
        }

        GetPhotoDetailResponse getPhotoDetailResponse = photoService.getPhotoDetail(userId, photoId);

        return ResponseEntity.ok(BaseResponse.success("사진 상세 조회 성공", getPhotoDetailResponse));
    }


    /**
     * 전체 사진 목록을 페이징 처리하여 조회하는 엔드포인트
     *
     * @return ResponseEntity<BaseResponse<Map<String, Object>>> 페이징된 사진 목록 응답
     */
    @GetMapping("/photos/{pageNum}")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getPaginatedPhotos(
            @PathVariable int pageNum) {

        Map<String, Object> response = photoService.getPaginatedPhotos(pageNum);

        return ResponseEntity.ok(BaseResponse.success("사진 리스트 조회 성공", response));
    }


    /**
     * 상위 5개의 인기 있는 사진을 조회하는 엔드포인트
     *
     * @return ResponseEntity<BaseResponse<List<GetPhotoTop5Response>>> 상위 5개의 인기 사진 목록 응답
     */
    @GetMapping("/photo/top5")
    public ResponseEntity<BaseResponse<List<GetPhotoTop5Response>>> getPhotoTop5(
    ) {

        List<GetPhotoTop5Response> getPhotoTop5ResponseList = photoService.getPhotoTop5();

        return ResponseEntity.ok(BaseResponse.success("Top5 사진 조회", getPhotoTop5ResponseList));
    }


    /**
     * S3 관련 미완성 API
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable String fileName) {
        byte[] data = photoService.downloadFile(fileName);
        ByteArrayResource resource = new ByteArrayResource(data);
        String permanentFolder = "permanent/";
        return ResponseEntity
                .ok()
                .contentLength(data.length)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + permanentFolder + fileName + "\"")
                .body(resource);
    }


    /**
     * 사진 좋아요를 토글하는 API
     *
     * @param request   사용자 인증 정보를 포함한 HTTP 요청 객체
     * @param photoId   좋아요를 토글할 사진의 ID
     * @return ResponseEntity<BaseResponse<Void>> 좋아요 상태에 따른 응답 메시지 반환
     */
    @PostMapping("/photo/like/{photoId}")
    public ResponseEntity<BaseResponse<Void>> toggleLike(
            HttpServletRequest request, @PathVariable Long photoId) {

        Long userId = oAuthService.findIdByNickName(request);
        Boolean like = photoService.toggleLike(userId, photoId);

        // 결과에 따른 응답 메시지 생성
        BaseResponse<Void> baseResponse = like ?
                BaseResponse.withMessage("사진 좋아요 완료") :
                BaseResponse.withMessage("사진 좋아요 취소 완료");

        // 응답 반환
        return ResponseEntity.ok(baseResponse);
    }


    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles() {
        return ResponseEntity.ok(photoService.listFiles());
    }
}

