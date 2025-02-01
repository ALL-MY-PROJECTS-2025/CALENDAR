package com.example.demo.domain.dto;


import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Slf4j
public class SettingsDto {
    private Long id;
    private String year;
    private String month;
    private String layout;
    private String imageArray;
    private boolean defaultValue;
}
