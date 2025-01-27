package com.example.demo.config.auth.provider;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KakaoUserInfo implements OAuth2UserInfo{
    private String id;
    private Map<String,Object> attributes;


    @Override
    public String getName() {
        return (String)attributes.get("nickname");
    }

    @Override
    public String getEmail() {
        return (String)attributes.get("email");
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return this.id;
    }
}
