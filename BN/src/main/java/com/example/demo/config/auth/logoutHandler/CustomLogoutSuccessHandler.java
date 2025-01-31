package com.example.demo.config.auth.logoutHandler;

import com.example.demo.config.auth.PrincipalDetails;
import com.example.demo.config.auth.jwt.JwtProperties;
import com.example.demo.config.auth.jwt.JwtTokenProvider;
import com.example.demo.domain.entity.JWTToken;
import com.example.demo.domain.repository.JWTTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.util.Arrays;

@Slf4j
public class CustomLogoutSuccessHandler implements org.springframework.security.web.authentication.logout.LogoutSuccessHandler {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    String KAKAO_CLIENT_ID;
    @Value("${spring.security.oauth2.client.kakao.logout.redirect.uri}")
    String KAKAO_LOGOUT_REDIRECT_URI;

    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String NAVER_CLIENT_ID;
    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String NAVER_CLIENT_SECRET;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JWTTokenRepository jwtTokenRepository;


    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("CustomLogoutSuccessHandler's onLogoutSuccess..invoke..");


        PrincipalDetails principalDetails = (PrincipalDetails) authentication.getPrincipal();
        String provider = principalDetails.getUserDto().getProvider();

        if(provider!=null && provider.equals("kakao")){
            response.sendRedirect("https://kauth.kakao.com/oauth/logout?client_id="+KAKAO_CLIENT_ID+"&logout_redirect_uri="+KAKAO_LOGOUT_REDIRECT_URI);
            return ;
        }else if(provider!=null && provider.equals("naver")){
            response.sendRedirect("https://nid.naver.com/nidlogin.logout?returl=https://www.naver.com/");
            return ;
        }else if(provider!=null && provider.equals("google")){
            response.sendRedirect("https://accounts.google.com/Logout");
            return ;
        }
        response.sendRedirect("/");
    }

}
