package com.example.demo.config.auth.exceptionHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONObject;
import org.springframework.security.core.AuthenticationException;

import java.io.IOException;
import java.io.PrintWriter;

@Slf4j
public class CustomAuthenticationEntryPoint implements org.springframework.security.web.AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        log.info("CustomAuthenticationEntryPoint's commence...invoke..."  + authException);
        //response.sendRedirect("/login?error="+authException.getMessage());
//        response.put("redirect" ,"/login");
//        response.put("auth", false);

        PrintWriter out =  response.getWriter();
        JSONObject obj = new JSONObject();
        obj.put("redirect","/login");
        obj.put("auth",false);
        out.write(obj.toString());

    }

}
