package com.example.demo.controller;


import com.example.demo.domain.dto.SettingsDto;
import com.example.demo.domain.entity.Settings;
import com.example.demo.domain.repository.SettingsRepository;
import com.example.demo.properties.UPLOADPATH;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@Slf4j
@RequestMapping("/settings")
public class SettingsRestController
{

    @Autowired
    private SettingsRepository settingsRepository;
    @PostMapping("/month")
    public ResponseEntity<String> saveMonthSettings(@RequestBody SettingsDto dto) {

        log.info("POST /settings/month..." + dto);
        boolean isDefaultValue = dto.isDefaultValue();
        if(isDefaultValue){
          Settings defaultSettings =  settingsRepository.findByDefaultValue(true);
          System.out.println("FIND DEFAULT : " + defaultSettings);
          if(defaultSettings!=null){
              defaultSettings.setDefaultValue(false);
              settingsRepository.save(defaultSettings);
          }
        }
        Settings settings =  settingsRepository.findByYearAndMonth(dto.getYear(),dto.getMonth());

        if(settings==null) {
            // Dto를 Entity로 변환
            settings = new Settings();
            settings.setYear(dto.getYear());
            settings.setMonth(dto.getMonth());
            settings.setLayout(dto.getLayout());
            settings.setImageArray(dto.getImageArray());
            settings.setDefaultValue(dto.isDefaultValue());
        }else{
            settings.setImageArray(dto.getImageArray());
            settings.setLayout(dto.getLayout());
            settings.setDefaultValue(dto.isDefaultValue());
        }
        settingsRepository.save(settings);
        //이곳 완성해줘

        return new ResponseEntity<>("성공!", HttpStatus.OK);
    }

    @GetMapping("/get/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getSettings(
            @PathVariable("year") String year,
            @PathVariable("month") String month
    ) {
        log.info("GET /settings/getSettings/{}/{}", year, month);

        Map<String, Object> response = new LinkedHashMap<>();
        Settings settings = settingsRepository.findByYearAndMonth(year, month);

        if (settings == null) {
            response.put("message", "해당 월에 대한 설정이 존재하지 않습니다.");
            Settings defaultSettings  =  settingsRepository.findByDefaultValue(true);
            System.out.println("DefaultSettings..."+defaultSettings);
            //해당연월을 기본값으로 저장
            settings = new Settings();
            settings.setYear(year);
            settings.setMonth(month);
            settings.setLayout(defaultSettings.getLayout());
            settings.setDefaultValue(false);
            settings.setImageArray(defaultSettings.getImageArray());

            settingsRepository.save(settings);

        }

        response.put("year", settings.getYear());
        response.put("month", settings.getMonth());
        response.put("layout", settings.getLayout());
        response.put("imageArray", settings.getImageArray());
        response.put("defaultValue", settings.isDefaultValue());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }




}
