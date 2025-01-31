package com.example.demo.config.auth.redis;

import com.example.demo.config.auth.jwt.JwtProperties;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.redis.core.RedisHash;

@RedisHash(value = "JwtToken", timeToLive = JwtProperties.EXPIRATION_TIME_REFRESH)
@AllArgsConstructor
@Getter
@Setter
public class Redis {
    @Id
    private String email;
    private String refreshToken;
}