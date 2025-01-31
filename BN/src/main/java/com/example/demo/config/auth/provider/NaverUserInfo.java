package com.example.demo.config.auth.provider;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NaverUserInfo implements OAuth2UserInfo{
    private String id;
    private Map<String,Object> attributes;

    @Override
    public String getName() {
        return attributes.get("nickname").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }

    @Override
    public String getProvider() {
        return "naver";
    }

    @Override
    public String getProviderId() {
        return id;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
