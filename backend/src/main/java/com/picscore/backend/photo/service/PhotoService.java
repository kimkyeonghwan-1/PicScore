package com.picscore.backend.photo.service;

import com.picscore.backend.photo.model.response.*;
import com.picscore.backend.photo.model.request.UploadPhotoRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 사진 관련 비즈니스 로직을 처리하는 서비스 인터페이스
 */
public interface PhotoService {

    /**
     * 새로운 사진을 저장하는 메서드
     */
    SavePhotoResponse savePhoto(Long userId, UploadPhotoRequest request);

    /**
     * 임시 파일을 S3에 업로드하는 메서드
     */
    UploadPhotoResponse uploadFile(MultipartFile file) throws IOException;

    /**
     * 프로필 이미지를 S3에 업로드하는 메서드
     */
    String uploadProfileFile(MultipartFile file) throws IOException;

    /**
     * 특정 키워드(해시태그)로 사진을 검색하는 메서드
     */
    List<GetPhotosResponse> searchPhotosByHashtag(String keyword);

    /**
     * 특정 사진을 삭제하는 메서드
     */
    void deletePhoto(Long photoId, Long userId);

    /**
     * 페이징 처리된 사진 목록을 조회하는 메서드
     */
    Map<String, Object> getPaginatedPhotos(int pageNum, String sort);

    /**
     * 특정 사용자의 사진을 조회하는 메서드
     */
    List<GetPhotosResponse> getPhotosByUserId(Long userId, Boolean isPublic);

    /**
     * 특정 사진의 상세 정보를 조회하는 메서드 (비회원도 접근 가능)
     */
    GetPhotoDetailResponse getPhotoDetail(Long userId, Long photoId);

    /**
     * 특정 사진의 공개/비공개 상태를 토글하는 메서드
     */
    void togglePublic(Long photoId, Long userId);

    /**
     * 좋아요 수 기준 상위 5개의 사진을 조회하는 메서드
     */
    List<GetPhotoTop5Response> getPhotoTop5();

    /**
     * S3에서 파일을 다운로드하여 바이트 배열로 반환하는 메서드
     */
    byte[] downloadFile(String fileName);

    /**
     * S3에서 파일을 삭제하는 메서드
     */
    void deleteFile(String imageUrl);

    /**
     * 사진에 대한 좋아요 토글 메서드
     */
    Boolean toggleLike(Long userId, Long photoId);

    /**
     * S3에서 프로필 이미지 삭제
     */
    void deleteProfileFile(String imageUrl);

    /**
     * S3 버킷 내 모든 파일 목록 조회
     */
    List<String> listFiles();

    /**
     * 파일 존재 여부 확인
     */
    Boolean doesFileExist(String key);

    /**
     * permanent 폴더 파일명 추출
     */
    String extractFileName(String url);

    /**
     * profile 폴더 파일명 추출
     */
    String extractProfileFileName(String url);

    /**
     * S3 파일 URL 생성
     */
    String getFileUrl(String folder, String fileName);
}
