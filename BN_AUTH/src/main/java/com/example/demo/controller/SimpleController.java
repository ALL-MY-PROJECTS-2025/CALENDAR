package com.example.demo.controller;


import com.example.demo.config.auth.PrincipalDetails;
import com.example.demo.domain.dto.UserDto;
import com.example.demo.domain.entity.User;
import com.example.demo.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Controller
@Slf4j
public class SimpleController {
//    @GetMapping("/user")
//    public void user(){
//        log.info("GET /user...");
//    }

//	@GetMapping("/user")
//	public void user(Authentication authentication, Model model) {
//		//log.info("GET /user..." + authentication);
//        log.info("GET /user...");
////		log.info("name..." + authentication.getName());
//		log.info("principal..." + authentication.getPrincipal());
//		log.info("authorities..." + authentication.getAuthorities());
//		log.info("details..." + authentication.getDetails());
//		log.info("credential..." + authentication.getCredentials());
//        model.addAttribute("authentication",authentication);
//
//	}

//	@GetMapping("/user")
//	public void user(@AuthenticationPrincipal PrincipalDetails principalDetails, Model model) {
//		log.info("GET /user..." + principalDetails);
//        model.addAttribute("principalDetails",principalDetails);
//	}

//	@GetMapping("/user")
//	public void user() {
//		log.info("GET /user...");
//
//		Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();
//		System.out.println(authentication);
//
//
//        Collection<GrantedAuthority> authorities = (Collection<GrantedAuthority>) authentication.getAuthorities();
//        authorities.forEach(authority -> {
//            authority.getAuthority();
//        });
//
//
//	}

    @GetMapping("/member")
    public void member(){
        log.info("GET /member...");
    }
    @GetMapping("/admin")
    public void admin(){
        log.info("GET /admin...");
    }

//    @GetMapping("/login")
//    public void login(){
//        log.info("GET /login...");
//    }


    @GetMapping("/join")
    public void join(){
        log.info("GET /join...");
    }






}
