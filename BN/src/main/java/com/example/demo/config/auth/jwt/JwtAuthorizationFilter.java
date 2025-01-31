package com.example.demo.config.auth.jwt;

import com.example.demo.config.auth.redis.RedisUtil;
import com.example.demo.domain.entity.JWTToken;
import com.example.demo.domain.entity.User;
import com.example.demo.domain.repository.JWTTokenRepository;
import com.example.demo.domain.repository.SignatureRepository;
import com.example.demo.domain.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.thymeleaf.util.StringUtils;

import java.io.IOException;
import java.util.*;

/**
 * JWT를 이용한 인증 (쿠키 기반)
 */
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final UserRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JWTTokenRepository jwtTokenRepository;
    private final RedisUtil redisUtil;


    public JwtAuthorizationFilter(
            UserRepository memberRepository,
            JwtTokenProvider jwtTokenProvider,
            JWTTokenRepository jwtTokenRepository,
            RedisUtil redisUtil
    ) {
        this.memberRepository = memberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtTokenRepository = jwtTokenRepository;
        this.redisUtil = redisUtil;

    }
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {
        System.out.println("[JWTAUTHORIZATIONFILTER] doFilterInternal...");
        String accessToken = null;
        String refreshToken = null;
        String username = null;
        try {
            // 1. 쿠키에서 Access Token 및 Refresh Token 추출
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (JwtProperties.ACCESS_TOKEN_NAME.equals(cookie.getName())) {
                        accessToken = cookie.getValue();
                    } else if (JwtProperties.REFRESH_TOKEN_NAME.equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                    }
                    else if ("username".equals(cookie.getName())) {
                        username = cookie.getValue();
                    }
                }
            }
            System.out.println("[JWTAUTHORIZATIONFILTER] access-token: " + accessToken);
            System.out.println("[JWTAUTHORIZATIONFILTER] refresh-toekn : " + refreshToken);
            String redis_refreshToekn = redisUtil.getRefreshToken(username);
            System.out.println("[JWTAUTHORIZATIONFILTER] redis refresh-toekn : " + redis_refreshToekn);

            if (accessToken != null) {
                //유효성 체크
                if (jwtTokenProvider.validateAccessToken(accessToken)) {
                    Authentication authentication = getUsernamePasswordAuthenticationToken(accessToken);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("[JWTAUTHORIZATIONFILTER] Access Token 유효함");
                }else if(jwtTokenProvider.validateRefreshToken(refreshToken)){
                    //accesstoken 만료 -> refreshtoken 유효 -> accesstoken 갱신하기
                    //DB로 유저정보 찾기
                    User user =  memberRepository.findById(username).get();
                    long now = (new Date()).getTime();
                    Date accessTokenExpiresIn = new Date(now + JwtProperties.EXPIRATION_TIME); // 60초후 만료

                    accessToken = Jwts.builder()
                            .setSubject(user.getUsername())
                            .claim("username",user.getUsername()) //정보저장
                            .claim("auth", user.getRole())//정보저장
                            .claim("provider", user.getProvider())//정보저장
                            .claim("providerId", user.getProviderId())//정보저장
                            .setExpiration(accessTokenExpiresIn)
                            .signWith(jwtTokenProvider.getKey(), SignatureAlgorithm.HS256)
                            .compact();

                    Cookie accessCookie = new Cookie(JwtProperties.ACCESS_TOKEN_NAME, accessToken);
                    accessCookie.setHttpOnly(true);
                    accessCookie.setSecure(false);//  ONLY HTTPS 개발 환경에서는 false, 운영 환경에서는 true
                    accessCookie.setPath("/"); // Define valid paths
                    accessCookie.setMaxAge(JwtProperties.EXPIRATION_TIME); // 1 hour expiration

                    //----------------------------------------------------------------
                    //response에 쿠키 전달 하려면
                    //----------------------------------------------------------------
                    response.addCookie(accessCookie);
                    Map<String, Object> responseBody = new HashMap<>();
                    responseBody.put("message", "Access token refreshed");
                    responseBody.put("renewal", true); // 갱신 여부 전달
                    response.getWriter().write(new ObjectMapper().writeValueAsString(responseBody));
                    System.out.println("[JWTAUTHORIZATIONFILTER] Access Token 갱신 처리완료 " + accessToken);
                    return ;

                }else{
                    //refresh 토큰 만료 -> 쿠키삭제 및 redis 삭제
                    //REDIS 삭제
                    redisUtil.delete(username);
                    //----------------------------------------------------------------
                    //ACCESS-TOKEN, REFRESH-TOKEN , USERNAME삭제
                    //----------------------------------------------------------------
                    Cookie cookie1 = new Cookie(JwtProperties.ACCESS_TOKEN_NAME, null); // 값 설정 (null 또는 빈 문자열)
                    cookie1.setHttpOnly(true); // HttpOnly 설정
                    cookie1.setSecure(false);
                    cookie1.setPath("/"); // 쿠키 경로 설정
                    cookie1.setMaxAge(0); // 만료 시간 0으로 설정
                    response.addCookie(cookie1); // 응답에 쿠키 추가

                    Cookie cookie2 = new Cookie(JwtProperties.REFRESH_TOKEN_NAME, null); // 값 설정 (null 또는 빈 문자열)
                    cookie2.setHttpOnly(true); // HttpOnly 설정
                    cookie2.setSecure(false);
                    cookie2.setPath("/"); // 쿠키 경로 설정
                    cookie2.setMaxAge(0); // 만료 시간 0으로 설정
                    response.addCookie(cookie2); // 응답에 쿠키 추가

                    Cookie cookie3 = new Cookie("username", null); // 값 설정 (null 또는 빈 문자열)
                    cookie3.setHttpOnly(true); // HttpOnly 설정
                    cookie3.setSecure(false);
                    cookie3.setPath("/"); // 쿠키 경로 설정
                    cookie3.setMaxAge(0); // 만료 시간 0으로 설정
                    response.addCookie(cookie3); // 응답에 쿠키 추가
                    //----------------------------------------------------------------
                    //response에 쿠키 전달 하려면
                    //----------------------------------------------------------------
                    response.addCookie(cookie1);
                    response.addCookie(cookie2);
                    response.addCookie(cookie3);
                    Map<String, Object> responseBody = new HashMap<>();
                    responseBody.put("message", "refresh token expired");
                    responseBody.put("renewal", false); // 갱신 여부 전달
                    responseBody.put("expired", true); // 갱신 여부 전달
                    response.getWriter().write(new ObjectMapper().writeValueAsString(responseBody));
                    System.out.println("[JWTAUTHORIZATIONFILTER] refresh Token 만료");
                    return ;
                }
            }else{
                //accesstoken null
            }

        } catch (Exception e) {
            System.out.println("[JWTAUTHORIZATIONFILTER] 에러 발생: " + e.getMessage());
            //LOGIN PAGE 로 이동
        }
        chain.doFilter(request, response);
    }

    /**
     * JWT 토큰으로 User를 찾아서 UsernamePasswordAuthenticationToken를 만들어서 반환한다.
     * User가 없다면 null 반환
     */
    private Authentication getUsernamePasswordAuthenticationToken(String token) {
        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        Optional<User> user = memberRepository.findById(authentication.getName()); // 유저를 유저명으로 찾습니다.

        if (user.isPresent()) {
            return authentication;
        }
        return null; // 유저가 없으면 NULL
    }
}
