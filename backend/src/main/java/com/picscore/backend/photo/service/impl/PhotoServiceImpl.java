package com.picscore.backend.photo.service.impl;

import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.photo.model.entity.PhotoLike;
import com.picscore.backend.photo.model.request.UploadPhotoRequest;
import com.picscore.backend.photo.model.response.*;
import com.picscore.backend.photo.repository.PhotoHashtagRepository;
import com.picscore.backend.photo.repository.PhotoLikeRepository;
import com.picscore.backend.photo.repository.PhotoRepository;
import com.picscore.backend.photo.service.HashtagService;
import com.picscore.backend.photo.service.PhotoService;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 사진 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class PhotoServiceImpl implements PhotoService {


    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final PhotoLikeRepository photoLikeRepository;
    private final PhotoHashtagRepository photoHashtagRepository;

    private final HashtagService hashtagService;

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;


    /**
     * 새로운 사진을 저장하는 메서드
     *
     * @param userId 사진을 업로드한 사용자
     * @param request UploadPhotoRequest 요청 바디
     * @return ResponseEntity<BaseResponse<HttpStatus>> 저장 결과
     */
    @Override
    @Transactional
    public SavePhotoResponse savePhoto(
            Long userId, UploadPhotoRequest request) {

        String tempFolder = "temp/";
        String permanentFolder = "permanent/";

        // S3에서 임시 폴더에서 영구 폴더로 이미지 이동
        CopyObjectRequest copyObjectRequest = CopyObjectRequest.builder()
                .sourceBucket(bucketName)    // 원본 버킷
                .sourceKey(tempFolder+request.getImageName())        // 원본 경로
                .destinationBucket(bucketName) // 동일한 버킷 내 복사
                .destinationKey(permanentFolder+request.getImageName()) // 새로운 경로
                .build();
        s3Client.copyObject(copyObjectRequest);

        String permanImageUrl = getFileUrl(permanentFolder,request.getImageName());
        if (permanImageUrl == null || permanImageUrl.trim().isEmpty()) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 URL이 생성되지 않았습니다: " + request.getImageName());
        }

        // mySQL에 저장
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));
        Photo photo = new Photo(
                user, permanImageUrl, request.getScore(),request.getIsPublic(),
                request.getPhotoType(), request.getAnalysisChart(), request.getAnalysisText());
        photoRepository.save(photo);
        SavePhotoResponse response = new SavePhotoResponse(photo.getId());
        // 해시태그 저장은 HashtagService에 위임
        hashtagService.saveHashtags(photo, request.getHashTag());

        return response;
    }


    /**
     * 임시 파일을 S3에 업로드하는 메서드
     *
     * @param file 업로드할 MultipartFile 객체
     * @return ResponseEntity<BaseResponse<UploadPhotoResponse>> 업로드 결과 응답
     * @throws IOException 파일 처리 중 발생할 수 있는 입출력 예외
     */
    @Override
    @Transactional
    public UploadPhotoResponse uploadFile(
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "업로드 파일이 유효하지 않습니다");
        }

        // UUID를 사용하여 고유한 파일명 생성
        String fileName = UUID.randomUUID() + getFileExtension(file.getOriginalFilename());

        String tempFolder = "temp/";
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(tempFolder + fileName)
                .contentType(file.getContentType())
                .build();

        try {
            // S3에 파일 업로드
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 업로드 성공 시 응답 생성
            UploadPhotoResponse response = new UploadPhotoResponse(getFileUrl(tempFolder, fileName), fileName);
            return response;
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드 실패: " + e.getMessage());
        }
    }


    /**
     * 프로필 이미지 파일을 S3에 업로드하는 메서드
     *
     * @param file 업로드할 MultipartFile 객체
     * @return String 업로드된 파일의 URL
     * @throws IOException 파일 처리 중 발생할 수 있는 입출력 예외
     */
    @Override
    public String uploadProfileFile(
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "업로드 파일이 유효하지 않습니다");
        }

        String fileName = UUID.randomUUID() + "." + getFileExtension(file.getOriginalFilename());
        String tempFolder = "profile/";

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(tempFolder + fileName)
                .contentType(file.getContentType())
                .build();

        try {
            // S3에 파일 업로드
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 업로드된 파일의 URL 반환
            return getFileUrl(tempFolder, fileName);
        } catch (Exception e) {
            // 업로드 실패 시 에러 로그 출력 및 예외 발생
            System.out.println("파일 업로드 실패: " + e.getMessage());
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }


    /**
     * 주어진 키워드(해시태그)로 사진을 검색하는 메서드
     *
     * @param keyword 검색할 해시태그 키워드
     * @return ResponseEntity<BaseResponse<List<GetPhotosResponse>>> 검색된 사진 목록
     */
    @Override
    public List<GetPhotosResponse> searchPhotosByHashtag(
            String keyword) {

        List<GetPhotosResponse> responses = photoRepository.findPhotosByHashtagName(keyword);

        return responses;
    }


    /**
     * 특정 사진을 삭제하는 메서드
     *
     * @param photoId 삭제할 사진의 ID
     * @param userId 삭제 요청을 한 사용자의 ID
     */
    @Override
    @Transactional
    public void deletePhoto(
            Long photoId, Long userId) {

        // 사진 조회
        Photo photo = photoRepository.findPhotoById(photoId);

        if (photo == null) {
            // 사진이 존재하지 않을 경우 에러 반환
            throw new CustomException(HttpStatus.NOT_FOUND, "해당 사진을 찾을 수 없습니다.");
        }

        // 사진 소유자 정보 조회
        User user = photo.getUser();

        if (!user.getId().equals(userId)) {
            // 요청한 사용자 ID가 사진 소유자가 아닐 경우 에러 반환
            throw new CustomException(HttpStatus.FORBIDDEN, "사진 삭제 권한이 없습니다.");
        }
        // mySQL에서 삭제
        photoRepository.delete(photo);
        // S3에서 삭제
        deleteFile(photo.getImageUrl());
    }


    /**
     * 전체 사진을 페이징 처리하여 조회하는 메서드
     *
     * @param pageNum 조회할 페이지 번호 (1부터 시작)
     * @return ResponseEntity<BaseResponse<Map<String, Object>>> 페이징된 사진 목록
     */
    @Override
    public Map<String, Object> getPaginatedPhotos(
            int pageNum, String sort) {

        if (pageNum < 1) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상의 값이어야 합니다.");
        }

        Page<Photo> photoPage;
        PageRequest pageRequest;

        if (sort == null || sort.equalsIgnoreCase("latest")) {
            pageRequest = PageRequest.of(pageNum - 1, 24, Sort.by(Sort.Direction.DESC, "createdAt"));
            photoPage = photoRepository.findAllWithPublic(pageRequest);

        } else if (sort.equalsIgnoreCase("score")) {
            pageRequest = PageRequest.of(pageNum - 1, 24, Sort.by(Sort.Direction.DESC, "score"));
            photoPage = photoRepository.findAllWithPublic(pageRequest);

        } else if (sort.equalsIgnoreCase("like")) {
            pageRequest = PageRequest.of(pageNum - 1, 24);
            photoPage = photoRepository.findAllOrderByLikeCount(pageRequest);

        } else {
            throw new CustomException(HttpStatus.BAD_REQUEST, "지원하지 않는 정렬 방식입니다.");
        }

        // 페이지 데이터 존재 여부 확인
        if (pageNum > photoPage.getTotalPages() || photoPage.getContent().isEmpty()) {
            throw new CustomException(HttpStatus.NOT_FOUND, "해당 페이지에 랭킹 정보가 없습니다");
        }

        // DTO 변환
        List<GetPhotosResponse> photoResponses = photoPage.getContent().stream()
                .map(photo -> new GetPhotosResponse(photo.getId(), photo.getImageUrl()))
                .collect(Collectors.toList());

        // 응답 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("totalPages", photoPage.getTotalPages());
        responseData.put("currentPage", pageNum);
        responseData.put("photos", photoResponses);

        // 응답 반환
        return responseData;
    }


    /**
     * 특정 사용자의 사진을 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @param isPublic 공개/비공개 여부
     * @return ResponseEntity<BaseResponse<List<GetPhotosResponse>>> 조회된 사진 목록
     */
    @Override
    public List<GetPhotosResponse> getPhotosByUserId(
            Long userId, Boolean isPublic) {

        if (userId == null || userId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자 ID입니다.");
        }

        if (isPublic == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "공개 여부(isPublic)는 필수 입력값입니다.");
        }

        List<Photo> photos = photoRepository.findPhotosByUserId(userId, isPublic);
        List<GetPhotosResponse> getPhotoResponses = photos.stream()
                .map(photo -> new GetPhotosResponse(photo.getId(), photo.getImageUrl()))
                .collect(Collectors.toList());

        return getPhotoResponses;
    }


    /**
     * 특정 사진의 상세 정보를 조회하는 메서드 (비회원도 접근 가능)
     *
     * @param userId  요청한 사용자 ID (비회원일 경우 null)
     * @param photoId 조회할 사진의 ID
     * @return 사진 상세 정보 응답 DTO
     */
    @Override
    public GetPhotoDetailResponse getPhotoDetail(Long userId, Long photoId) {

        if (photoId == null || photoId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사진 ID입니다.");
        }

        // Photo 정보 조회
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "해당 사진을 찾을 수 없습니다."));

        // User 정보 조회 (Photo와 연관된 User)
        User user = photo.getUser();

        // 좋아요 수 조회
        int likeCnt = photoLikeRepository.countByPhotoId(photoId);

        // 기본적으로 비회원의 경우 isLike = false
        Boolean isLike = false;

        // 회원이라면 좋아요 여부 조회
        if (userId != null && userId > 0) {
            isLike = photoLikeRepository.existsByPhotoIdAndUserId(photoId, userId);
        }

        // 해시태그 조회
        List<String> hashTags = photoHashtagRepository.findByPhotoId(photoId)
                .stream()
                .map(photoHashtag -> photoHashtag.getHashtag().getName())
                .collect(Collectors.toList());

        // DTO에 데이터 설정
        return new GetPhotoDetailResponse(user, photo, likeCnt, hashTags, isLike);
    }



    /**
     * 사진의 공개/비공개 상태를 토글하는 메서드
     *
     * @param photoId 상태를 변경할 사진의 ID
     * @param userId 변경 요청을 한 사용자의 ID
     */
    @Override
    public void togglePublic(Long photoId, Long userId) {
        // 사진 조회
        Photo photo = photoRepository.findPhotoById(photoId);

        if (photo == null) {
            // 사진이 존재하지 않을 경우 에러 반환
            throw new CustomException(HttpStatus.NOT_FOUND, "해당 사진을 찾을 수 없습니다.");
        }

        // 사진 소유자 정보 조회
        User user = photo.getUser();
        if (!user.getId().equals(userId)) {
            // 요청한 사용자 ID가 사진 소유자가 아닐 경우 에러 반환
            throw new CustomException(HttpStatus.FORBIDDEN, "사진 수정 권한이 없습니다.");
        }
        photoRepository.togglePublic(photoId);
    }


    /**
     * 좋아요 수 기준 상위 5개의 사진을 조회하는 메서드
     *
     * @return ResponseEntity<BaseResponse<List<GetPhotoTop5Response>>> 상위 5개 사진 목록
     */
    @Override
    public List<GetPhotoTop5Response> getPhotoTop5() {

        PageRequest pageRequest = PageRequest.of(0, 5);

        List<Object[]> results = photoRepository.findTop5PhotosWithLikeCount(pageRequest);

        List<GetPhotoTop5Response> responses =
                results.stream()
                        .map(result -> {
                            Photo photo = (Photo) result[0];
                            Long likeCount = (Long) result[1];
                            return new GetPhotoTop5Response(
                                    photo.getId(),
                                    photo.getImageUrl(),
                                    photo.getScore(),
                                    likeCount
                            );
                        })
                        .collect(Collectors.toList());

        return responses;
    }


    /**
     * S3에서 파일을 다운로드하여 바이트 배열로 반환하는 메서드
     *
     * @param fileName 다운로드할 파일의 이름
     * @return byte[] 파일의 바이트 배열
     */
    @Override
    public byte[] downloadFile(String fileName) {
        String permanentFolder = "permanent/";
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(permanentFolder + fileName)
                .build();

        // S3에서 파일을 바이트 배열로 가져오기
        return s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
    }


    /**
     * S3에서 파일을 삭제하는 메서드
     *
     * @param imageUrl 삭제할 파일의 URL
     */
    @Override
    public void deleteFile(String imageUrl) {
        // URL에서 파일명을 추출
        String imageName = extractFileName(imageUrl);
        String permanentFolder = "permanent/";

        // S3에 삭제 요청 생성 및 실행
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(permanentFolder + imageName)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }


    /**
     * 사진에 대한 좋아요 토글 메서드
     *
     * @param userId  사용자 ID
     * @param photoId 사진 ID
     * @return 좋아요 상태 (true: 좋아요, false: 좋아요 취소)
     */
    @Override
    public Boolean toggleLike(
            Long userId, Long photoId) {

        if (userId == null || userId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자 ID입니다.");
        }

        if (photoId == null || photoId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사진 ID입니다.");
        }

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "해당 사진을 찾을 수 없습니다. 사진 ID: " + photoId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다. 사용자 ID: " + userId));

        Optional<PhotoLike> existPhotoLike = photoLikeRepository.findByPhotoIdAndUserId(photoId, userId);

        if (existPhotoLike.isPresent()) {
            // 기존 팔로우 관계가 있으면 삭제
            photoLikeRepository.delete(existPhotoLike.get());
            return false;
        } else {
            PhotoLike photoLike = new PhotoLike(
                    photo, user
            );
            photoLikeRepository.save(photoLike);
        }
        return true;
    }


    /**
     * S3에서 프로필 이미지를 삭제하는 메서드
     *
     * @param imageUrl 삭제할 프로필 이미지의 URL
     */
    @Override
    public void deleteProfileFile(String imageUrl) {
        // URL에서 프로필 이미지 파일명을 추출
        String imageName = extractProfileFileName(imageUrl);
        if (imageName == null) {
            System.out.println("유효하지 않은 이미지 URL: " + imageUrl);
            return;
        }

        String profileFolder = "profile/";

        // S3에 삭제 요청 생성 및 실행
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(profileFolder + imageName)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }


    /**
     * S3 버킷 내 모든 파일 목록을 조회하는 메서드
     *
     * @return List<String> 버킷 내 모든 파일 이름 목록
     */
    @Override
    public List<String> listFiles() {
        ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .build();

        // S3에서 객체 목록 조회
        ListObjectsV2Response response = s3Client.listObjectsV2(listObjectsRequest);

        // 객체 키(파일 이름) 목록 반환
        return response.contents().stream()
                .map(S3Object::key)
                .collect(Collectors.toList());
    }


    /**
     * URL에서 permanent 폴더의 파일명을 추출하는 메서드
     *
     * @param url 파일 URL
     * @return String 추출된 파일명 (없으면 null 반환)
     */
    @Override
    public String extractFileName(String url) {
        String prefix = "permanent/";
        int index = url.indexOf(prefix);

        if (index != -1) {
            return url.substring(index + prefix.length());
        }

        return null; // permanent/가 없는 경우 null 반환
    }


    /**
     * URL에서 profile 폴더의 파일명을 추출하는 메서드
     *
     * @param url 프로필 이미지 URL
     * @return String 추출된 파일명 (없으면 null 반환)
     */
    @Override
    public String extractProfileFileName(String url) {
        String prefix = "profile/";
        int index = url.indexOf(prefix);

        if (index != -1) {
            return url.substring(index + prefix.length());
        }

        return null; // profile/가 없는 경우 null 반환
    }


    /**
     * S3 버킷 내 특정 폴더와 파일명을 기반으로 파일 URL을 생성하는 메서드
     *
     * @param folder 폴더 이름 (예: "profile/", "permanent/")
     * @param fileName 파일 이름
     * @return String 생성된 파일 URL
     */
    @Override
    public String getFileUrl(String folder, String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s%s",
                bucketName,
                s3Client.serviceClientConfiguration().region(),
                folder,
                fileName);
    }

    /**
     * S3에서 특정 파일이 존재하는지 확인하는 메서드
     *
     * @param key 파일 키 (폴더명 + 파일명)
     * @return boolean 파일이 존재하면 true, 없으면 false
     */
    @Override
    public Boolean doesFileExist(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true; // 요청 성공 시 파일이 존재함
        } catch (S3Exception e) { // NoSuchKeyException 대신 S3Exception 사용
            if (e.awsErrorDetails().errorCode().equals("404")) {
                return false; // 파일이 존재하지 않음
            }
            throw e; // 다른 예외는 다시 던짐
        }
    }


    /**
     * 파일명에서 확장자를 추출하는 메서드
     *
     * @param originalFileName 원본 파일명
     * @return String 파일 확장자 (점 포함)
     */
    private String getFileExtension(String originalFileName) {
        // 1. null 또는 빈 문자열 체크
        if (originalFileName == null || originalFileName.isEmpty()) {
            return "";
        }

        // 2. 마지막 점(.) 위치 찾기
        int extensionIndex = originalFileName.lastIndexOf('.');

        // 3. 유효성 검사 (점이 없거나, 첫 문자에 있을 경우 제외)
        if (extensionIndex <= 0 || extensionIndex >= originalFileName.length() - 1) {
            return "";
        }

        // 4. 소문자로 통일하여 반환 (선택사항)
        return originalFileName.substring(extensionIndex);
    }
}