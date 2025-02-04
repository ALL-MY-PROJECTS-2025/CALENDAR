package com.example.demo.domain.repository;


import com.example.demo.domain.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<Settings,Long> {

    Settings findByYearAndMonth(String year, String month);
    Settings findByYearAndMonthAndUser(String year, String month,String user);

    Settings findByDefaultValue(boolean defaultValue);
    Settings findByDefaultValueAndUser(boolean defaultValue,String user);
}
