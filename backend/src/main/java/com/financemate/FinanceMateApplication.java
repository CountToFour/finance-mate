package com.financemate;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinanceMateApplication {

	public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load();
        System.setProperty("EXCHANGE_RATE_API_KEY", dotenv.get("EXCHANGE_RATE_API_KEY"));

		SpringApplication.run(FinanceMateApplication.class, args);
	}

}
