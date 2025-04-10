package com.picscore.backend.photo.repository;

import com.picscore.backend.photo.model.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 해시태그 관련 DB 작업을 처리하는 Repository
 */
@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {


    /**
     * 해시태그 이름으로 해시태그를 조회합니다.
     *
     * @param name 해시태그 이름
     * @return 해당 이름을 가진 해시태그가 존재하면 Optional로 반환
     */
    Optional<Hashtag> findByName(String name);
}


