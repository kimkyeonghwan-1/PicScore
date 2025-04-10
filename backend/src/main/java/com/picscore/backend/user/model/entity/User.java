package com.picscore.backend.user.model.entity;

import com.picscore.backend.common.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Getter
@NoArgsConstructor
@Table(name = "user")
public class User extends BaseEntity {

    @Id
    @Column(name = "user_id", columnDefinition = "INT UNSIGNED")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "social_id", nullable = false ,length = 50)
    private String socialId;

    @Column(name = "social_type", nullable = false)
    private String socialType;

    @Column(name = "nickname", nullable = true, length = 20)
    private String nickName;

    @Column(name = "profile_image", nullable = true, length = 300)
    private String profileImage;

    @Column(name = "message", nullable = true, length = 30)
    private String message;

    @Column(name = "level", nullable = false)
    private int level;

    @Column(name = "experience", nullable = false)
    private int experience;

    public User(String socialId, String socialType, String nickName, String profileImage, String message, int level, int experience) {
        this.socialId = socialId;
        this.socialType = socialType;
        this.nickName = nickName;
        this.profileImage = profileImage;
        this.message = message;
        this.level = level;
        this.experience = experience;
    }


    /**
     * 사용자 프로필 정보를 업데이트합니다.
     *
     * @param nickName      새로운 닉네임
     * @param profileImage  새로운 프로필 이미지 URL
     * @param message       새로운 상태 메시지
     */
    public void updateProfile(String nickName, String profileImage, String message) {
        this.nickName = nickName;
        this.profileImage = profileImage;
        this.message = message;
    }


    /**
     * 사용자 경험치를 설정합니다.
     *
     * @param experience 경험치 값
     */
    public void updateExperience(int experience) {
        this.experience = experience;
    }


    /**
     * 현재 경험치를 기반으로 사용자의 레벨을 계산하고 업데이트합니다.
     *
     * 레벨 계산 방식:
     * - 초기 레벨: 0
     * - 0 → 1 레벨업 기준: 1000 경험치
     * - 이후 레벨업마다 필요 경험치 500씩 증가
     *   예: 0→1: 1000, 1→2: 1500, 2→3: 2000, ...
     *
     * @param experience 현재 누적된 경험치
     */
    public void updateLevel(int experience) {
        int level = 0;  // 기본 레벨
        int threshold = 1000;  // 0 -> 1 레벨업에 필요한 경험치
        int increment = 500;   // 증가량 (매 레벨마다 증가)

        while (experience >= threshold) {
            level++;
            increment += 500;  // 다음 레벨의 필요 경험치 증가
            threshold += increment;  // 다음 레벨업 기준 갱신
        }

        this.level = level;
    }
}
