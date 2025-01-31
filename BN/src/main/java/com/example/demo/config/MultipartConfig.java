package com.example.demo.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

@Configuration
public class MultipartConfig {
    //  2.x버전
//        @Bean
//    public MultipartResolver multipartResolver() {
//        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
//        multipartResolver.setMaxUploadSize(1024*1024*200); 			// 20MB	//전체 업로드 허용 사이즈
//        multipartResolver.setMaxUploadSizePerFile(1024*1024*20); 	// 20MB	//파일 1개당 허용가능한 업로드 사이즈
//        multipartResolver.setMaxInMemorySize(20971520); 		// 20MB //캐시 공간
//        return multipartResolver;
//    }

        // 참고 https://kindloveit.tistory.com/112
        @Bean
        public MultipartResolver multipartResolver() {
            StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
            return multipartResolver;

        }

        @Bean
        public MultipartConfigElement multipartConfigElement() {
            MultipartConfigFactory factory = new MultipartConfigFactory();
            factory.setMaxRequestSize(DataSize.ofBytes(1024*1024*50)); // 전체 Request최대 사이즈 50MG
            factory.setMaxFileSize(DataSize.ofBytes(1024*1024*50)); //1개파일당 최대 사이즈 50Mb
        return factory.createMultipartConfig();
    }



}