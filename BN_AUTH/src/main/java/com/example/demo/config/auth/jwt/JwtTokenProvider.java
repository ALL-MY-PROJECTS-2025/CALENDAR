package com.example.demo.config.auth.jwt;


import com.example.demo.config.auth.PrincipalDetails;
import com.example.demo.domain.dto.UserDto;
import com.example.demo.domain.entity.JWTToken;
import com.example.demo.domain.entity.Signature;
import com.example.demo.domain.entity.User;
import com.example.demo.domain.repository.JWTTokenRepository;
import com.example.demo.domain.repository.SignatureRepository;
import com.example.demo.domain.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.Key;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    @Autowired
    private SignatureRepository signatureRepository;

    @Autowired
    private JWTTokenRepository jwtTokenRepository;

    @Autowired
    private HttpServletResponse response;

    @Autowired
    private UserRepository userRepository;

    //서명키 저장
    @Getter
    private Key key;
    public void setKey(Key key){
        this.key = key;
    }
    public JwtTokenProvider(){
    }
    @PostConstruct
    public void init(){

            List<Signature> list =  signatureRepository.findAll();
            if(list.isEmpty()){
                byte[] keyBytes = KeyGenerator.getKeygen();
                this.key = Keys.hmacShaKeyFor(keyBytes);
                Signature signature = new Signature();
                signature.setKeyBytes(keyBytes);
                signature.setCreateAt(LocalDate.now());
                signatureRepository.save(signature);
                System.out.println("JwtTokenProvider Constructor  최초 Key init: " + key);
            }else{
                Signature signature = list.get(0);
                byte[] keyBytes =signature.getKeyBytes();
                this.key = Keys.hmacShaKeyFor(keyBytes);
                System.out.println("JwtTokenProvider Constructor  DB Key init: " + key);
            }
    }


    // 유저 정보를 가지고 AccessToken, RefreshToken 을 생성하는 메서드
    public TokenInfo generateToken(Authentication authentication) {
        // 권한 가져오기
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();

        PrincipalDetails principalDetails = (PrincipalDetails) authentication.getPrincipal();
        UserDto userDto = principalDetails.getUserDto();

        // Access Token 생성
        Date accessTokenExpiresIn = new Date(now + JwtProperties.EXPIRATION_TIME); // 60초후 만료
        String accessToken = Jwts.builder()
                .setSubject(authentication.getName())
                .claim("username",userDto.getUsername()) //정보저장
                .claim("auth", authorities)//정보저장
                .claim("principal", authentication.getPrincipal())//정보저장
                .claim("provider", userDto.getProvider())//정보저장
                .claim("providerId", userDto.getProviderId())//정보저장
                .claim("oauth2AccessToken", principalDetails.getAccessToken())//정보저장
                .claim("oauth2Attributes", principalDetails.getAttributes())//정보저장

//                .claim("credentials", authentication.getCredentials())//정보저장
//                .claim("details", authentication.getDetails())//정보저장


                .setExpiration(accessTokenExpiresIn)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Refresh Token 생성
        Date refreshTokenExpiresIn = new Date(now + JwtProperties.EXPIRATION_TIME_REFRESH); // 60초후 만료
        String refreshToken = Jwts.builder()
                .setSubject(authentication.getName())
                .claim("username",userDto.getUsername()) //정보저장
                .setExpiration(refreshTokenExpiresIn)    //1일: 24 * 60 * 60 * 1000 = 86400000
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        //System.out.println("JwtTokenProvider.generateToken.accessToken : " + accessToken);
        //System.out.println("JwtTokenProvider.generateToken.refreshToken : " + refreshToken);

        return TokenInfo.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }



    // JWT 토큰을 복호화하여 토큰에 들어있는 정보를 꺼내는 메서드
    public Authentication getAuthentication(String accessToken) {
        // 토큰 복호화
        Claims claims = parseClaims(accessToken);

        if (claims.get("auth") == null) {
            throw new RuntimeException("권한 정보가 없는 토큰입니다.");
        }
        // 클레임에서 권한 정보 가져오기
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("auth").toString().split(","))
                        .map(auth -> new SimpleGrantedAuthority(auth))
                        .collect(Collectors.toList());

        String username = claims.getSubject(); //username

        LinkedHashMap principal_tmp = (LinkedHashMap)claims.get("principal");
        String provider  = (String)claims.get("provider");
        String providerId  = (String)claims.get("providerId");
        String auth = (String)claims.get("auth");
        String oauth2AccessToken = (String)claims.get("oauth2AccessToken");
        LinkedHashMap<String,Object> oauth2Attributes = (LinkedHashMap<String,Object>)claims.get("oauth2Attributes");
        //System.out.println("oauth2Attributes : " + oauth2Attributes);

//        String credentials = (String)claims.get("credentials");
//        LinkedHashMap details = (LinkedHashMap)claims.get("details");
//        System.out.println("principal_tmp : " + principal_tmp );
//        System.out.println("provider : " + provider );
//        System.out.println("credentials : " + credentials );
//        System.out.println("details : " + details );
        // UserDetails 객체를 만들어서 Authentication 리턴
        PrincipalDetails principalDetails = new PrincipalDetails();
        UserDto userDto = new UserDto();
        userDto.setUsername(username);
        userDto.setRole(auth);
        userDto.setProvider(provider);
        userDto.setProviderId(providerId);
        principalDetails.setUserDto(userDto);
        principalDetails.setAccessToken(oauth2AccessToken);
        principalDetails.setAttributes(oauth2Attributes);
//        System.out.println("JwtTokenProvider.getAuthentication UsernamePasswordAuthenticationToken : " + accessToken);
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(principalDetails, claims.get("credentials"), authorities);
        return usernamePasswordAuthenticationToken;
    }

    private Claims parseClaims(String accessToken) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(accessToken).getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    // 토큰 정보를 검증하는 메서드
    public boolean validateToken(String token) throws IOException {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        }
        catch (ExpiredJwtException e) {

            //log.info("Expired JWT Token", e);
            log.info("Expired JWT Token..");
            //RefreshToken 가져오기
            JWTToken tokenEntity = jwtTokenRepository.findByAccessToken(token);
            if(tokenEntity!=null){
                String refreshToken = tokenEntity.getRefreshToken();
                if(refreshToken!=null&&validateToken(refreshToken)){
                    // 토큰 만료 access x , refresh o
                    log.info("RefreshToken 유효함.. accessToken 다시발급");

                    //AccessToken 재발급---------------------------
                    String username = tokenEntity.getUsername();
                    Optional<User> userOptional =  userRepository.findById(username);
                    String accessToken=null;
                    if(userOptional.isPresent()){
                        User user = userOptional.get();
                        long now = (new Date()).getTime();
                        Date accessTokenExpiresIn = new Date(now + JwtProperties.EXPIRATION_TIME); // 60초후 만료
                        PrincipalDetails principalDetails = new PrincipalDetails();
                        UserDto userDto = new UserDto();
                        userDto.setUsername(user.getUsername());
                        userDto.setRole(user.getRole());
                        userDto.setProvider(user.getProvider());
                        userDto.setProviderId(user.getProviderId());
                        principalDetails.setUserDto(userDto);

                        accessToken = Jwts.builder()
                                .setSubject(user.getUsername())
                                .claim("username",user.getUsername()) //정보저장
                                .claim("auth", user.getRole())//정보저장
                                .claim("principal", principalDetails)//정보저장
                                .claim("provider", user.getProvider())//정보저장
                                .claim("providerId", user.getProviderId())//정보저장
                                .setExpiration(accessTokenExpiresIn)
                                .signWith(key, SignatureAlgorithm.HS256)
                                .compact();
                    }
                    //---------------------------
                    tokenEntity.setAccessToken(accessToken);
                    jwtTokenRepository.save(tokenEntity);
                    //COOKIE 재전달
                    Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME,tokenEntity.getAccessToken());
                    cookie.setMaxAge(JwtProperties.EXPIRATION_TIME);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                    response.sendRedirect("/");
                    return true;
                }else{
                    // 토큰 만료 access x , refresh x
                    log.info("RefreshToken 만료!..");
                    ;
                }
            }else{
                // DB에 내용없음..
                log.info("DB에 JWT INFO  없음!..");
                ;
            }


        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }
    // 토큰 정보를 검증하는 메서드
    public boolean validateTokenAsync(String token) throws IOException {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        }
        catch (ExpiredJwtException e) {

            //log.info("Expired JWT Token", e);
            log.info("Expired JWT Token..");
            //RefreshToken 가져오기
            JWTToken tokenEntity = jwtTokenRepository.findByAccessToken(token);
            if(tokenEntity!=null){
                String refreshToken = tokenEntity.getRefreshToken();
                if(refreshToken!=null&&validateToken(refreshToken)){
                    // 토큰 만료 access x , refresh o
                    log.info("RefreshToken 유효함.. accessToken 다시발급");

                    //AccessToken 재발급---------------------------
                    String username = tokenEntity.getUsername();
                    Optional<User> userOptional =  userRepository.findById(username);
                    String accessToken=null;
                    if(userOptional.isPresent()){
                        User user = userOptional.get();
                        long now = (new Date()).getTime();
                        Date accessTokenExpiresIn = new Date(now + JwtProperties.EXPIRATION_TIME); // 60초후 만료
                        PrincipalDetails principalDetails = new PrincipalDetails();
                        UserDto userDto = new UserDto();
                        userDto.setUsername(user.getUsername());
                        userDto.setRole(user.getRole());
                        userDto.setProvider(user.getProvider());
                        userDto.setProviderId(user.getProviderId());
                        principalDetails.setUserDto(userDto);

                        accessToken = Jwts.builder()
                                .setSubject(user.getUsername())
                                .claim("username",user.getUsername()) //정보저장
                                .claim("auth", user.getRole())//정보저장
                                .claim("principal", principalDetails)//정보저장
                                .claim("provider", user.getProvider())//정보저장
                                .claim("providerId", user.getProviderId())//정보저장
                                .setExpiration(accessTokenExpiresIn)
                                .signWith(key, SignatureAlgorithm.HS256)
                                .compact();
                    }
                    //---------------------------
                    tokenEntity.setAccessToken(accessToken);
                    jwtTokenRepository.save(tokenEntity);

                    return true;
                }else{
                    // 토큰 만료 access x , refresh x
                    log.info("RefreshToken 만료!..");
                    jwtTokenRepository.deleteById(tokenEntity.getId());
                    ;
                }
            }else{
                // DB에 내용없음..
                log.info("DB에 JWT INFO  없음!..");
                ;
            }


        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }

    //----------------------------------------------------------------
    // RE
    //----------------------------------------------------------------
    public boolean validateAccessToken(String accessToken) throws IOException{
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(accessToken);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        }
        catch (ExpiredJwtException e) {
            log.info("Expired JWT Token..");
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }
    public boolean validateRefreshToken(String refreshToken) throws IOException{
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        }
        catch (ExpiredJwtException e) {
            log.info("Expired JWT Token..");
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }


}


