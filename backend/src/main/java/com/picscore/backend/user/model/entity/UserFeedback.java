package com.picscore.backend.user.model.entity;

import com.picscore.backend.common.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Getter
@NoArgsConstructor
@Table(name = "user_feedback")
public class UserFeedback extends BaseEntity {

    @Id
    @Column(name = "user_feedback_id", columnDefinition = "INT UNSIGNED")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone_number", nullable = false ,length = 15)
    private String phoneNumber;

    @Column(name = "message", nullable = false ,length = 300)
    private String message;

    public UserFeedback(String phoneNumber, String message) {
        this.phoneNumber = phoneNumber;
        this.message = message;
    }

}
