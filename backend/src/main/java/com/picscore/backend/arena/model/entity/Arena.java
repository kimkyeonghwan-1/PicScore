package com.picscore.backend.arena.model.entity;

import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "arena")
@NoArgsConstructor
public class Arena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "arena_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "activity_week", nullable = false)
    private String activityWeek;

    public Arena (User user, int score, String activityWeek) {
        this.user = user;
        this.score = score;
        this.activityWeek = activityWeek;
    }
    // 아레나 다 맞추면 스코어 증가
    public void increaseScore() {
        this.score += 1;
    }
    // 게임 주차가 다르면 초기화
    public void resetForNewWeek(String newWeek) {
        this.activityWeek = newWeek;
        this.score = 0;
    }


}
