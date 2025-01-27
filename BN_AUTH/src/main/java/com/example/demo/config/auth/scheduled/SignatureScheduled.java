package com.example.demo.config.auth.scheduled;

import com.example.demo.config.auth.jwt.JwtTokenProvider;
import com.example.demo.config.auth.jwt.KeyGenerator;
import com.example.demo.domain.entity.Signature;
import com.example.demo.domain.repository.SignatureRepository;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.LocalDate;
import java.util.List;


@Component
@EnableScheduling
public class SignatureScheduled {

    @Autowired
    private SignatureRepository signatureRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Scheduled(cron="0 0 0 * * *")
    public void t2() {
        List<Signature> list =  signatureRepository.findAll();
        byte[] keyBytes = KeyGenerator.getKeygen();
        Signature signature = null;
        if(list.isEmpty()){

            signature = new Signature();
            signature.setKeyBytes(keyBytes);
            signature.setCreateAt(LocalDate.now());
            signatureRepository.save(signature);

            Key key =  Keys.hmacShaKeyFor(keyBytes);
            jwtTokenProvider.setKey(key);

            System.out.println("Scheduled Key init..");
        }else{
            signature = list.get(0);
            signature.setKeyBytes(keyBytes);
            signature.setCreateAt(LocalDate.now());
            signatureRepository.deleteAll();
            signatureRepository.save(signature);

            Key key =  Keys.hmacShaKeyFor(keyBytes);
            jwtTokenProvider.setKey(key);
            System.out.println("Scheduled Key change..");

        }

    }

}
