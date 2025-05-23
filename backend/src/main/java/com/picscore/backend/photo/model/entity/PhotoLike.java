package com.picscore.backend.photo.model.entity;

import com.picscore.backend.common.model.entity.BaseEntity;
import com.picscore.backend.user.model.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "photo_like")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PhotoLike extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_like_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id")
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public PhotoLike(Photo photo, User user) {
        this.photo = photo;
        this.user = user;
    }

}
