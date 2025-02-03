package com.example.demo.domain.repository;

import com.example.demo.domain.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
    // 사용자명으로 Location 조회
    Location findByUser(String user);
} 