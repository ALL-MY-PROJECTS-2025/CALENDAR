package com.example.demo.controller;


import com.example.demo.properties.UPLOADPATH;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.ssl.SslProperties;
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
import java.util.*;
import java.util.stream.Collectors;

@RestController
@Slf4j
public class AlbumRestController {

    private static final String BASE_UPLOAD_DIR = "/your/upload/directory"; // ✅ 업로드할 기본 폴더 경로 설정 (예: "/home/uploads")

    @PostMapping("/upload")
    public void upload(
            @RequestParam("yyyy") String yyyy,
            @RequestParam("mm") String mm,
            @RequestParam("files") MultipartFile[] files) {

        if (files == null || files.length == 0) {
            log.warn("업로드할 파일이 없습니다.");
            return;
        }

        // ✅ 현재 날짜 기준으로 YYYY/MM 폴더 경로 생성
        String currentDatePath = yyyy + File.separator + mm;
        Path uploadPath = Paths.get(UPLOADPATH.ROOTDIRPATH + File.separator + UPLOADPATH.UPPERDIRPATH, currentDatePath);

        try {
            // ✅ 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // ✅ 현재 폴더 내 존재하는 파일 목록 가져오기
            Set<String> existingFileNames = new HashSet<>();
            File folder = uploadPath.toFile();
            File[] existingFiles = folder.listFiles((dir, name) -> name.endsWith(".png"));

            if (existingFiles != null) {
                for (File existingFile : existingFiles) {
                    existingFileNames.add(existingFile.getName()); // 기존 파일명 저장
                }
            }

            int imageNumber = 1; // 새 파일명 시작 번호

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // ✅ 중복되지 않는 새로운 파일명 찾기
                    String fileName;
                    do {
                        fileName = String.format("%02d.png", imageNumber);
                        imageNumber++;
                    } while (existingFileNames.contains(fileName)); // 중복 파일명 방지

                    Path filePath = uploadPath.resolve(fileName);

                    // ✅ 파일 저장
                    file.transferTo(filePath.toFile());
                    log.info("파일 저장 완료: {}", filePath);

                    // ✅ 새로 저장된 파일명 추가 (중복 방지)
                    existingFileNames.add(fileName);
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
        // ✅ 이미지 파일이 있는 경로 설정
        Path imageDirPath = Paths.get(UPLOADPATH.ROOTDIRPATH + File.separator + UPLOADPATH.UPPERDIRPATH, year, month);

        if (!Files.exists(imageDirPath) || !Files.isDirectory(imageDirPath)) {
            log.warn("요청한 디렉토리가 존재하지 않습니다: {}", imageDirPath);
            return ResponseEntity.notFound().build();
        }

        try {
            // ✅ 이미지 파일 필터링 (jpg, png, jpeg 확장자만)
            Map<String, String> imageMap = Files.list(imageDirPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().matches(".*\\.(png|jpg|jpeg)$")) // 이미지 확장자 필터링
                    .collect(Collectors.toMap(
                            path -> path.getFileName().toString(),  // 파일명
                            path -> {
                                try {
                                    byte[] imageBytes = Files.readAllBytes(path);
                                    return Base64.getEncoder().encodeToString(imageBytes);  // Base64 인코딩
                                } catch (IOException e) {
                                    log.error("이미지 로드 중 오류 발생: {}", path, e);
                                    return null;
                                }
                            }
                    ));

            if (imageMap.isEmpty()) {
                log.warn("요청한 경로에 이미지가 없습니다: {}", imageDirPath);
                return ResponseEntity.noContent().build();
            }
            // ✅ JSON 응답 생성
            return ResponseEntity.ok(imageMap);
        } catch (IOException e) {
            log.error("이미지 디렉토리 읽기 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    // ✅ 이미지 삭제 API (YYYY/MM/파일명 처리)
    @DeleteMapping("/deleteImage")
    public ResponseEntity<String> deleteImage(@RequestBody Map<String, String> request) {
        String filePath = request.get("filePath"); // 요청에서 "YYYY/MM/파일명" 형식의 경로 가져오기
        if (filePath == null || filePath.isEmpty()) {
            return ResponseEntity.badRequest().body("파일 경로가 제공되지 않았습니다.");
        }

        // ✅ 삭제할 파일의 전체 경로 설정
        Path fullPath = Paths.get(UPLOADPATH.ROOTDIRPATH + File.separator + UPLOADPATH.UPPERDIRPATH, filePath);
        File file = fullPath.toFile();

        // ✅ 파일이 존재하면 삭제
        if (file.exists()) {
            if (file.delete()) {
                return ResponseEntity.ok("이미지 삭제 완료: " + filePath);
            } else {
                return ResponseEntity.internalServerError().body("파일 삭제 실패: " + filePath);
            }
        } else {
            return ResponseEntity.notFound().build(); // 파일이 존재하지 않는 경우
        }
    }

}