package com.example.demo.config.auth.loginHandler;

import com.example.demo.config.auth.jwt.JwtProperties;
import com.example.demo.config.auth.jwt.JwtTokenProvider;
import com.example.demo.config.auth.jwt.TokenInfo;
import com.example.demo.domain.entity.JWTToken;
import com.example.demo.domain.repository.JWTTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
public class CustomLoginSuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JWTTokenRepository jwtTokenRepository;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        //JWTTOKEN Entity에 기존의 발급받은 토큰이 있는지
        String username =  authentication.getName();
        JWTToken dbToken = jwtTokenRepository.findByUsername(username);
        if(dbToken!= null){
            if(jwtTokenProvider.validateToken(dbToken.getAccessToken())){
//                JWTToken newToken = jwtTokenRepository.findByUsername(username);
//                Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME,newToken.getAccessToken());
//                cookie.setMaxAge(JwtProperties.EXPIRATION_TIME);
//                cookie.setPath("/");
//                response.addCookie(cookie);
                System.out.println("DB에 있는 access_token 을 전달");
            }else{
                //기존 토큰정보 삭제
                jwtTokenRepository.deleteById(dbToken.getId());
                //JWT TOKEN 생성 + 쿠키 전달(!)
                TokenInfo tokenInfo =jwtTokenProvider.generateToken(authentication);
                System.out.println("tokenInfo: " + tokenInfo);
                Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME,tokenInfo.getAccessToken());
                cookie.setMaxAge(JwtProperties.EXPIRATION_TIME);
                cookie.setPath("/");
                response.addCookie(cookie);
                System.out.println("새로 access_token 을 발급");
                JWTToken jwtToken = JWTToken.builder()
                        .accessToken(tokenInfo.getAccessToken())
                        .refreshToken(tokenInfo.getRefreshToken())
                        .username(username)
                        .issuedAt(LocalDateTime.now())
                        .build();
                jwtTokenRepository.save(jwtToken);
                System.out.println("access,refresh 토큰 만료.. DB기존토큰삭제..새롭게 토큰정보 생성,DB저장");
            }
        }else{
            //JWT TOKEN 생성 + 쿠키 전달(!)
            TokenInfo tokenInfo =jwtTokenProvider.generateToken(authentication);
            System.out.println("tokenInfo: " + tokenInfo);
            Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME,tokenInfo.getAccessToken());
            cookie.setMaxAge(JwtProperties.EXPIRATION_TIME);
            cookie.setPath("/");
            response.addCookie(cookie);
            System.out.println("새로 access_token 을 발급");
            JWTToken jwtToken = JWTToken.builder()
                                .accessToken(tokenInfo.getAccessToken())
                                .refreshToken(tokenInfo.getRefreshToken())
                                .username(username)
                                .issuedAt(LocalDateTime.now())
                                .build();
            jwtTokenRepository.save(jwtToken);
            System.out.println("최초 로그인 , DB JWT 저장 , JWT 쿠키 전달");

        }




        log.info("CustomLoginSuccessHandler's onAuthenticationSuccess invoke...");
        response.sendRedirect("/");

    }
}
