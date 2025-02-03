package com.example.demo.controller;


import com.example.demo.domain.entity.Location;
import com.example.demo.domain.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/location")
public class LocationRestController {

    @Autowired
    private LocationRepository locationRepository;

    @PostMapping
    public ResponseEntity<?> saveLocation(@RequestBody LocationRequest request) {
        // 기존 사용자의 위치 정보 확인
        String user = request.getUser() != null ? request.getUser() : "anonymous";
        Location existingLocation = locationRepository.findByUser(user);
        
        Location location;
        if (existingLocation != null) {
            // 기존 데이터가 있으면 주소만 업데이트
            existingLocation.setLocation(request.getAddress());
            location = locationRepository.save(existingLocation);
        } else {
            // 새로운 데이터 생성
            location = new Location();
            location.setLocation(request.getAddress());
            location.setUser(user);
            location = locationRepository.save(location);
        }
        
        return ResponseEntity.ok(location);
    }

    @GetMapping("/{user}")
    public ResponseEntity<?> getLocationByUser(@PathVariable("user") String user) {
        Location location = locationRepository.findByUser(user);
        
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(location);
    }
}

// Request DTO 클래스
class LocationRequest {
    private String address;
    private String user;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
} 