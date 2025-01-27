package com.example.demo.domain.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;



@SpringBootTest
class UserRepositoryTest {


    @Autowired
    public BCryptPasswordEncoder passwordEncoder;

    @Test
    public void t1(){
        System.out.println(passwordEncoder.encode("1234"));
    }

}