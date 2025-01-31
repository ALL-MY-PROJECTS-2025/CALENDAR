package com.example.demo.properties;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
@Component
public class UPLOADPATH {

    //WINDOW
//    public final static String ROOTDIRPATH = "c:" + File.separator;
//
//    //LINUX
////    public final static String ROOTDIRPATH = "/";
//
//    public final static String UPPERDIRPATH = "upload";
//    public final static String IMAGEDIRPATH ="images";
//    public final static String MUSICDIRPATH ="musics";
//    public final static String EDUPATH ="education";
//
//    public final static String FILEPATH = "files";

    public static String ROOTDIRPATH;
    //LINUX
//    public final static String ROOTDIRPATH = "/";
    public static String UPPERDIRPATH ;
    public static String IMAGEDIRPATH;
    public  static String MUSICDIRPATH ;
    public  static String EDUPATH;
    public  static String FILEPATH ;
    @Value("${root.path}")
    private String rootPath;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${image.path}")
    private String imagePath;

    @Value("${music.path}")
    private String musicPath;

    @Value("${edu.path}")
    private String eduPathProperty;

    @Value("${file.path}")
    private String filePathProperty;
    @PostConstruct
    public void init() {
        UPLOADPATH.ROOTDIRPATH = rootPath;
        UPLOADPATH.UPPERDIRPATH = uploadPath;
        UPLOADPATH.IMAGEDIRPATH = imagePath;
        UPLOADPATH.MUSICDIRPATH = musicPath;
        UPLOADPATH.EDUPATH = eduPathProperty;
        UPLOADPATH.FILEPATH = filePathProperty;
    }

    public static Long userImageMax=10L;
    public static Long userMusicMax=10L;
}