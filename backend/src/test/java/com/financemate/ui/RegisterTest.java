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

public class RegisterTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("http://localhost:5173/register");
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testEmptyFormValidation() {
        WebElement submitButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
        submitButton.click();

        WebElement usernameInput = driver.findElement(By.name("username"));
        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));

        assertEquals("true", usernameInput.getAttribute("aria-invalid"), "Pole nazwy użytkownika powinno zgłaszać błąd");
        assertEquals("true", emailInput.getAttribute("aria-invalid"), "Pole email powinno zgłaszać błąd");
        assertEquals("true", passwordInput.getAttribute("aria-invalid"), "Pole hasła powinno zgłaszać błąd");
    }

    @Test
    public void testInvalidEmailFormatValidation() {
        WebElement usernameInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("username")));
        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));

        usernameInput.sendKeys("TestowyUser");
        emailInput.sendKeys("niepoprawny-email.com");
        passwordInput.sendKeys("Haslo123!");

        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        assertEquals("true", emailInput.getAttribute("aria-invalid"), "Pole email powinno wyłapać błędny format adresu");
    }

    @Test
    public void testSuccessfulRegistration() {
        WebElement usernameInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("username")));
        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));

        String timestamp = String.valueOf(System.currentTimeMillis());

        usernameInput.sendKeys("User" + timestamp);
        emailInput.sendKeys("testuser" + timestamp + "@example.com");
        passwordInput.sendKeys("SuperTajneHaslo123");

        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        assertTrue(driver.getCurrentUrl().contains("/dashboard"), "Po poprawnej rejestracji URL powinien zmienić się na /dashboard");
    }

    @Test
    public void testEmailAlreadyTakenError() {
        WebElement usernameInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("username")));
        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));

        usernameInput.sendKeys("DubelUser");
        emailInput.sendKeys("user2@email.com");
        passwordInput.sendKeys("Haslo123");

        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        wait.until(ExpectedConditions.attributeToBe(emailInput, "aria-invalid", "true"));
        assertEquals("true", emailInput.getAttribute("aria-invalid"), "Formularz powinien zablokować rejestrację i zwrócić błąd zajętego maila");
    }

    @Test
    public void testNavigateToLogin() {
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class, 'MuiButton-textSecondary')]")
        ));

        loginButton.click();

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"), "Powinno nastąpić przekierowanie na stronę logowania");
    }
}