package com.picscore.backend.arena.repository;

import com.picscore.backend.arena.model.entity.Arena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArenaRepository extends JpaRepository<Arena, Long> {
    Optional<Arena> findByUserIdAndActivityWeek(Long userId, String activityWeek);

    Optional<Arena> findByUserId(Long userId);
}
