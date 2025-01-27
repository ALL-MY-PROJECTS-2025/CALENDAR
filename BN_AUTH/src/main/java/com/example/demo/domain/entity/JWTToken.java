package com.example.demo.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="JWTToken")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class JWTToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="accessToken",columnDefinition = "TEXT",nullable = false)
    private String accessToken;

    @Column(name="refreshToken",columnDefinition = "TEXT",nullable = false)
    private String refreshToken;

    @Column(name="username",length=255,nullable = false)
    private String username;

    @Column(name="issuedAt",columnDefinition = "DATETIME",nullable = false)
    private LocalDateTime issuedAt;

}
