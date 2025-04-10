package com.picscore.backend.photo.model.response;

import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.user.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class GetPhotoDetailResponse {
    // User 정보
    public Long userId;
    public String nickName;
    public String profileImage;

    // Photo 정보
    public Long photoId;
    public String imageUrl;
    public Float score;
    public Map<String, Integer> analysisChart; // JSON 형태로 저장된 데이터

    public Integer version;
    public Map<String, String> analysisText;  // JSON 형태로 저장된 데이터

    public LocalDateTime createdAt;

    // 기타 정보
    public int likeCnt;          // 좋아요 수
    public Boolean isLike;
    public Boolean isPublic;
    public List<String> hashTag; // 해시태그 리스트

    public GetPhotoDetailResponse(
            User user, Photo photo, int likeCnt, List<String> hashTag, Boolean isLike) {
        // User 정보 설정
        this.userId = user.getId();
        this.nickName = user.getNickName();
        this.profileImage = user.getProfileImage();

        // Photo 정보 설정
        this.photoId = photo.getId();
        this.imageUrl = photo.getImageUrl();
        this.score = photo.getScore();
        this.analysisChart = photo.getAnalysisChart();
        this.analysisText = photo.getAnalysisText();
        this.createdAt = photo.getCreatedAt();

        // version
        this.version = (analysisChart != null && analysisChart.containsKey("노이즈")) ? 1 : 2;

        // 기타 정보 설정
        this.likeCnt = likeCnt;
        this.isLike = isLike;
        this.isPublic = photo.getIsPublic();
        this.hashTag = hashTag;
    }
}
