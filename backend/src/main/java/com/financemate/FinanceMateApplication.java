package com.financemate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinanceMateApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceMateApplication.class, args);
	}

}
