package com.example.demo.config;


import com.example.demo.properties.UPLOADPATH;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/js/**").addResourceLocations("classpath:/static/js/"); //.setCachePeriod(60*60*24*365);
        registry.addResourceHandler("/css/**").addResourceLocations("classpath:/static/css/"); //.setCachePeriod(60*60*24*365);
        registry.addResourceHandler("/assets/**").addResourceLocations("classpath:/static/assets/"); //.setCachePeriod(60*60*24*365);
        registry.addResourceHandler("/font/**").addResourceLocations("classpath:/static/font/");//.setCachePeriod(60*60*24*365);
        registry.addResourceHandler("/upload/**").addResourceLocations("file:/"+ UPLOADPATH.UPPERDIRPATH +"/");//.setCachePeriod(60*60*24*365);
    }





}