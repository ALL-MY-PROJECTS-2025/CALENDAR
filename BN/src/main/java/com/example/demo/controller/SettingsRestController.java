package com.example.demo.controller;


import com.example.demo.domain.dto.SettingsDto;
import com.example.demo.domain.entity.Settings;
import com.example.demo.domain.repository.SettingsRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

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
            response.put("year", defaultSettings.getYear());
            response.put("month", defaultSettings.getMonth());
            response.put("layout", defaultSettings.getLayout());
            response.put("imageArray", defaultSettings.getImageArray());
            response.put("defaultValue", defaultSettings.isDefaultValue());

            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);

        }

        response.put("year", settings.getYear());
        response.put("month", settings.getMonth());
        response.put("layout", settings.getLayout());
        response.put("imageArray", settings.getImageArray());
        response.put("defaultValue", settings.isDefaultValue());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
