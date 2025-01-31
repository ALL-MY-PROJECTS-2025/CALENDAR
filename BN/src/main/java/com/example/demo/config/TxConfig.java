package com.example.demo.config;

import javax.sql.DataSource;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class TxConfig {
	
	@Autowired
	private DataSource dataSource;

//	@Bean(name="dataSourceTransactionManager")
//	public DataSourceTransactionManager transactionManager() {
//		return new DataSourceTransactionManager(dataSource);
//	}

	// JPA TransactionManager Settings
	@Bean(name="jpaTransactionManager")
	public JpaTransactionManager jpaTransasctionManager(EntityManagerFactory entityManagerFactory) {
		JpaTransactionManager transactionManager = new JpaTransactionManager();
		transactionManager.setEntityManagerFactory(entityManagerFactory);
		transactionManager.setDataSource(dataSource);
		return transactionManager;
	}


}
