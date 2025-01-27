package com.example.demo.config.auth;

import com.example.demo.config.auth.provider.GoogleUserInfo;
import com.example.demo.config.auth.provider.KakaoUserInfo;
import com.example.demo.config.auth.provider.NaverUserInfo;
import com.example.demo.config.auth.provider.OAuth2UserInfo;
import com.example.demo.domain.dto.UserDto;
import com.example.demo.domain.entity.User;
import com.example.demo.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class PrincipalDetailsOauth2ServiceImpl extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println("PrincipalDetailsOauth2ServiceImpl's loadUser ..." + userRequest);
        System.out.println("userRequest.getClientRegistration() :"+ userRequest.getClientRegistration());
        System.out.println("userRequest.getAccessToken() : "+ userRequest.getAccessToken());
        System.out.println("userRequest.getAdditionalParameters() : "+ userRequest.getAdditionalParameters());
        System.out.println("userRequest.getAccessToken().getTokenValue() : "+ userRequest.getAccessToken().getTokenValue());
        System.out.println("userRequest.getAccessToken().getTokenType().getValue() : "+ userRequest.getAccessToken().getTokenType().getValue());
        System.out.println("userRequest.getAccessToken().getScopes() : "+ userRequest.getAccessToken().getScopes());

        //OAuth2UserInfo
        OAuth2User oAuthUser = super.loadUser(userRequest);
        System.out.println();
        System.out.println("oAuthUser : " + oAuthUser);
        //OAUTH2 SERVER 구별
        OAuth2UserInfo oAuth2UserInfo = null;
        String provider = userRequest.getClientRegistration().getRegistrationId();
        if(provider.startsWith("kakao")){
            String id = oAuthUser.getAttributes().get("id").toString();
            Map<String,Object> attributes = (Map<String,Object>)oAuthUser.getAttributes().get("properties");
//            System.out.println("kakao id : " + id);
//            System.out.println("kakao attributes : " + attributes);
            oAuth2UserInfo = new KakaoUserInfo(id,attributes);
            System.out.println("KakaoUserInfo : " + oAuth2UserInfo);

        }else if(provider.startsWith("naver")){
            Map<String,Object> attributes = (Map<String,Object>)oAuthUser.getAttributes().get("response");
            String id = attributes.get("id").toString();
            System.out.println("naver id : " + id);
            System.out.println("naver response : " + attributes);
            oAuth2UserInfo = new NaverUserInfo(id,attributes);
            System.out.println("NaverUserInfo : " + oAuth2UserInfo);
        }else if(provider.startsWith("google")){
            Map<String,Object> attributes = (Map<String,Object>)oAuthUser.getAttributes();
            String id = attributes.get("sub").toString();
            System.out.println("google id : " + id);
            System.out.println("google attribute : " + attributes);
            oAuth2UserInfo = new GoogleUserInfo(id,attributes);
            System.out.println("GoogleUserInfo : " + oAuth2UserInfo);
        }



        //DB 조회
        String username = oAuth2UserInfo.getProvider()+"_"+oAuth2UserInfo.getProviderId();
        String password = passwordEncoder.encode("1234");
        Optional<User> userOptional =  userRepository.findById(username);

        UserDto userDto = null;
        if(userOptional.isPresent()){
            //기존계정이 존재 Entity->Dto
            User user = userOptional.get();
            userDto = new UserDto();
            userDto.setUsername(user.getUsername());
            userDto.setPassword(user.getPassword());
            userDto.setRole(user.getRole());
            userDto.setProvider(user.getProvider());
            userDto.setProviderId(user.getProviderId());

        }else{
            //새로운계정 DB저장
            //Entity 생성 값
            User user = new User();
            user.setUsername(username);
            user.setPassword(password);
            user.setRole("ROLE_USER");
            user.setProvider(oAuth2UserInfo.getProvider());
            user.setProviderId(oAuth2UserInfo.getProviderId());
            userRepository.save(user);

            userDto = new UserDto();
            userDto.setUsername(username);
            userDto.setPassword(password);
            userDto.setRole("ROLE_USER");
            userDto.setProvider(oAuth2UserInfo.getProvider());
            userDto.setProviderId(oAuth2UserInfo.getProviderId());
        }

        PrincipalDetails principalDetails = new PrincipalDetails();
        principalDetails.setUserDto(userDto);                       //변경예정
        principalDetails.setAttributes(oAuth2UserInfo.getAttributes());  //변경예정
        principalDetails.setAccessToken(userRequest.getAccessToken().getTokenValue());
        return principalDetails;
    }
}
