package com.example.demo.config.auth.redis;

import lombok.Data;
import lombok.Getter;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;


@Component
@Data
public class RedisProperties {
    public static final int port = 6379 ;
//    public static final String host = "bn_redis-container";
    public static final String host = "localhost";
}