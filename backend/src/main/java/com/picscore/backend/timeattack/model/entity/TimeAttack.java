package com.picscore.backend.timeattack.model.entity;

import com.picscore.backend.common.model.entity.BaseEntity;
import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.user.model.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Getter
@NoArgsConstructor
@Table(name = "time_attack")
public class TimeAttack extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "time_attack_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "photo_image")
    private String photoImage;

    @Column(name = "topic")
    private String topic;

    @Column(name = "activity_week")
    private String activityWeek;

    @Column(name = "ranking", nullable = true)
    private int ranking;

    @Column(name = "score")
    private float score;

    public TimeAttack(User user, String photoImage, String topic, String activityWeek, float score) {
        this.user = user;
        this.photoImage = photoImage;
        this.topic = topic;
        this.activityWeek = activityWeek;
        this.score = score;
    }
}
