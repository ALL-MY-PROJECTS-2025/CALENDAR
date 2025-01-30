package com.example.demo.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class UploadRestController {


    @PostMapping("/upload")
    public void uplaod(){
        log.info("/POST /upload..");

    }
}
