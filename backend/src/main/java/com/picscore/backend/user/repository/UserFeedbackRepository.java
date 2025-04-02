package com.picscore.backend.user.repository;

import com.picscore.backend.user.model.entity.Follow;
import com.picscore.backend.user.model.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
}
