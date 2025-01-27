package com.example.demo.domain.repository;

import com.example.demo.domain.entity.JWTToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JWTTokenRepository extends JpaRepository<JWTToken,Long> {

    //AccessToken 을 받아 Entity 반환
    JWTToken findByAccessToken(String accessToken);

    //Username 을 받아 Entity 반환
    JWTToken findByUsername(String username);

}
