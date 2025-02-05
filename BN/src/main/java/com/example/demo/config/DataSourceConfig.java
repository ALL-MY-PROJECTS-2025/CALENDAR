package com.example.demo.config;

import javax.sql.DataSource;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariDataSource;



@Configuration
public class DataSourceConfig {
	
	@Bean
	public DataSource dataSource() {

		HikariDataSource dataSource = new HikariDataSource();
		dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
//		dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3330/bookdb");
		dataSource.setJdbcUrl("jdbc:mysql://mysql8-container:3306/bookdb");

		dataSource.setUsername("root");
		dataSource.setPassword("Zhfldk11!");
		
		dataSource.setMaximumPoolSize(10);

		return dataSource;
	}
	
}
