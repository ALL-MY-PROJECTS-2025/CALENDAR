package com.example.demo.controller;


import com.example.demo.properties.UPLOADPATH;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
@RestController
@Slf4j
public class AlbumRestController {

    private static final String BASE_UPLOAD_DIR = "/your/upload/directory"; // ✅ 업로드할 기본 폴더 경로 설정 (예: "/home/uploads")

    @PostMapping("/upload")
    public void upload(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            log.warn("업로드할 파일이 없습니다.");
            return;
        }

        // ✅ 현재 날짜 기준으로 YYYY/MM 폴더 경로 생성
        String currentDatePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path uploadPath = Paths.get(UPLOADPATH.ROOTDIRPATH + File.separator + UPLOADPATH.UPPERDIRPATH, currentDatePath);

        try {
            // ✅ 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // ✅ 현재 폴더 내 기존 파일 개수 확인
            int imageNumber = 1;
            File folder = uploadPath.toFile();
            File[] existingFiles = folder.listFiles((dir, name) -> name.endsWith(".png"));

            if (existingFiles != null) {
                imageNumber = existingFiles.length + 1; // 기존 파일 개수 + 1
            }

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // ✅ 저장할 파일명 지정 (01.png, 02.png, ...)
                    String fileName = String.format("%02d.png", imageNumber);
                    Path filePath = uploadPath.resolve(fileName);

                    // ✅ 파일 저장
                    file.transferTo(filePath.toFile());

                    log.info("파일 저장 완료: {}", filePath);

                    // ✅ 다음 파일번호 증가
                    imageNumber++;
                }
            }
        } catch (IOException e) {
            log.error("파일 업로드 실패: {}", e.getMessage());
        }
    }

    @GetMapping("/getAlbum/{year}/{month}")
    public ResponseEntity<Map<String, String>> getAlbum(
            @PathVariable("year") String year,
            @PathVariable("month") String month
    ) {
        // ✅ 이미지 파일 경로 설정
        Path imagePath = Paths.get(UPLOADPATH.ROOTDIRPATH + File.separator + UPLOADPATH.UPPERDIRPATH, year, month, "image.png");

        if (!Files.exists(imagePath)) {
            log.warn("요청한 이미지가 존재하지 않습니다: {}", imagePath);
            return ResponseEntity.notFound().build();
        }

        try {
            // ✅ 파일을 읽고 Base64 인코딩
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // ✅ JSON 응답 생성
            Map<String, String> response = new HashMap<>();
            response.put("image", base64Image);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("이미지 로드 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}