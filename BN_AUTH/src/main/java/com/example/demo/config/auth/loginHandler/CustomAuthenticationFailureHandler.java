package com.example.demo.config.auth.loginHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.yaml.snakeyaml.util.UriEncoder;

import java.io.IOException;
import java.net.URLEncoder;

@Slf4j
public class CustomAuthenticationFailureHandler implements org.springframework.security.web.authentication.AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        log.info("CustomAuthenticationFailureHandler's onAuthenticationFailure invoke...");
        response.sendRedirect("/login?error="+ URLEncoder.encode(exception.getMessage()));
    }
}
