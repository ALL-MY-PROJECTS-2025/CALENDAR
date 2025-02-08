package com.example.demo.config;

import com.example.demo.config.auth.exceptionHandler.CustomAccessDeniedHandler;
import com.example.demo.config.auth.exceptionHandler.CustomAuthenticationEntryPoint;
import com.example.demo.config.auth.jwt.JwtAuthorizationFilter;
import com.example.demo.config.auth.jwt.JwtTokenProvider;
import com.example.demo.config.auth.loginHandler.CustomLoginSuccessHandler;
import com.example.demo.config.auth.logoutHandler.CustomLogoutHandler;
import com.example.demo.config.auth.logoutHandler.CustomLogoutSuccessHandler;
import com.example.demo.config.auth.redis.RedisUtil;
import com.example.demo.domain.repository.JWTTokenRepository;
import com.example.demo.domain.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JWTTokenRepository jwtTokenRepository;

    @Autowired
    private RedisUtil redisUtil;

    @Bean
    public SecurityFilterChain config(HttpSecurity http) throws Exception {

        //CSRF 비활성화
        http.csrf((config)->{config.disable();});

        //http.csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());


        // CORS 설정
        http.cors((config)->{
            config.configurationSource(corsConfigurationSource());
        });

        //권한 체크
        http.authorizeHttpRequests((auth)->{

            auth.requestMatchers("/join","/login","/validate","/health").permitAll();


            auth.requestMatchers("/upload").hasRole("USER");
            auth.requestMatchers("/getAlbum").hasRole("USER");
            auth.requestMatchers("/deleteImage").hasRole("USER");
            auth.requestMatchers("/downloadAlbum").hasRole("USER");
            auth.requestMatchers("/downloadAllAlbums").hasRole("USER");

            auth.requestMatchers("/location/save").hasRole("USER");
            auth.requestMatchers("/location/get").hasRole("USER");


            auth.requestMatchers("/settings/month").hasRole("USER");
            auth.requestMatchers("/settings/get").hasRole("USER");
            auth.anyRequest().authenticated();
        });


        //로그인
        http.formLogin((login)->{
            login.disable();
//            login.permitAll();
//            login.loginPage("/login");
//            login.successHandler(customLoginSuccessHandler());
//            login.failureHandler(new CustomAuthenticationFailureHandler());
        });

        //로그아웃
        http.logout((logout)->{
            logout.permitAll();
            logout.logoutUrl("/logout");
            logout.addLogoutHandler(customLogoutHandler());
            logout.logoutSuccessHandler(customLogoutSuccessHandler());
        });

        //예외처리
        http.exceptionHandling((exception)->{
            exception.authenticationEntryPoint(new CustomAuthenticationEntryPoint());
            exception.accessDeniedHandler(new CustomAccessDeniedHandler());
        });

        //REMEMBER ME
        http.rememberMe((rm)->{
            rm.rememberMeParameter("remember-me");
            rm.alwaysRemember(false);
            rm.tokenValiditySeconds(30*30);
            rm.tokenRepository(tokenRepository());
        });

        //OAUTH2-CLIENT
        http.oauth2Login((auth)->{
            auth.loginPage("/login");
            auth.successHandler(customLoginSuccessHandler());
        });

        //SESSION INVALIDATE..
        http.sessionManagement(
                httpSecuritySessionManagementConfigurer ->
                        httpSecuritySessionManagementConfigurer.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
        );


        //JWT AUTH FILTER ADDED
//        http.addFilterBefore(new JwtAuthorizationFilter(userRepository,jwtTokenProvider,jwtTokenRepository,redisUtil),
//                BasicAuthenticationFilter.class);

        http.addFilterBefore(new JwtAuthorizationFilter(userRepository,jwtTokenProvider,jwtTokenRepository,redisUtil),
                LogoutFilter.class);

        //OAUTH2 SESSION쿠키 제거필터
        http.addFilterBefore(sessionRemoveFilter(),
                BasicAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public PersistentTokenRepository tokenRepository() {
        JdbcTokenRepositoryImpl repo = new JdbcTokenRepositoryImpl();
        repo.setDataSource(dataSource);
        return repo;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder){
//        InMemoryUserDetailsManager userDetailsManager = new InMemoryUserDetailsManager();
//
//        userDetailsManager.createUser(
//                User.withUsername("user")
//                       .password(passwordEncoder.encode("1234"))
//                       .roles("USER")
//                       .build()
//        );
//        userDetailsManager.createUser(
//                User.withUsername("member")
//                       .password(passwordEncoder.encode("1234"))
//                       .roles("MEMBER")
//                       .build()
//        );
//        userDetailsManager.createUser(
//                User.withUsername("admin")
//                       .password(passwordEncoder.encode("1234"))
//                       .roles("ADMIN")
//                       .build()
//        );
//
//        return userDetailsManager;
//    }

    @Bean
    CustomLogoutSuccessHandler customLogoutSuccessHandler(){
        return new CustomLogoutSuccessHandler();
    }
    @Bean
    CustomLogoutHandler customLogoutHandler(){
        return new CustomLogoutHandler();
    }

    @Bean
    CustomLoginSuccessHandler customLoginSuccessHandler(){
        return new CustomLoginSuccessHandler();
    }


    @Bean
    Filter sessionRemoveFilter(){

        return new Filter(){
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

                if(response instanceof HttpServletResponse) {
                    HttpServletResponse resp = (HttpServletResponse) response;
                    resp.setHeader("Set-Cookie", "JSESSIONID=; Path=/; Max-Age=0; HttpOnly");
                }
                chain.doFilter(request, response);
            }
        };
    }

    //    CORS PERMIT DOMAIN
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedHeaders(Collections.singletonList("*")); // 허용 헤더
        config.setAllowedMethods(Collections.singletonList("*")); // 허용 메서드

        // 허용할 도메인 추가
        config.setAllowedOriginPatterns(Arrays.asList(
//                "*"
                "http://52.79.188.126:3000"
//                "http://192.168.1.10:3000",
//                "http://react-container:3000",
//                "http://localhost",
//                "http://192.168.1.10",
//                "http://react-container"
        ));

        config.setAllowCredentials(true); // COOKIE TOKEN OPTION

        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                return config;
            }
        };
    }


    //ATHENTICATION MANAGER 설정 - 로그인 직접처리를 위한 BEAN
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }


}
