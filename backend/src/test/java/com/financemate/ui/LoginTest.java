package com.financemate.ui;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("http://localhost:5173/login");
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testSuccessfulLogin() {
        WebElement emailInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
        WebElement passwordInput = driver.findElement(By.name("password"));

        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("first@email.com");
        passwordInput.sendKeys("testtest");

        submitButton.click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        assertTrue(driver.getCurrentUrl().contains("/dashboard"), "Adres URL powinien zawierać /dashboard");
    }

    @Test
    public void testEmptyFieldsValidation() {
        WebElement submitButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
        submitButton.click();

        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));

        assertEquals("true", emailInput.getAttribute("aria-invalid"), "Pole email powinno zgłaszać błąd");
        assertEquals("true", passwordInput.getAttribute("aria-invalid"), "Pole hasła powinno zgłaszać błąd");
    }

    @Test
    public void testInvalidCredentialsError() {
        WebElement emailInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("nieistniejacy@example.com");
        passwordInput.sendKeys("ZleHaslo123");

        submitButton.click();

        WebElement rootErrorMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(@class, 'MuiTypography-root') and contains(@class, 'MuiTypography-body2')]")
        ));

        assertTrue(rootErrorMsg.getText().toLowerCase().contains("bad credentials"),
                "Komunikat błędu powinien zawierać tekst 'bad credentials'");

        assertEquals("true", emailInput.getAttribute("aria-invalid"),
                "Pole email powinno być podświetlone na czerwono (błąd walidacji)");

        assertEquals("true", passwordInput.getAttribute("aria-invalid"),
                "Pole hasła powinno być podświetlone na czerwono (błąd walidacji)");
    }

    @Test
    public void testNavigateToRegister() {
        WebElement registerButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class, 'MuiButton-textSecondary')]")
        ));

        registerButton.click();

        wait.until(ExpectedConditions.urlContains("/register"));
        assertTrue(driver.getCurrentUrl().contains("/register"), "Przeglądarka powinna przejść na stronę rejestracji");
    }
}