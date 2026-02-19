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

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DashboardTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        driver.get("http://localhost:5173/login");

        WebElement emailInput = wait.until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("user2@email.com");
        passwordInput.sendKeys("testtest");
        submitButton.click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testDashboardHeaderAndTotalBalanceAreVisible() {
        WebElement header = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h5[contains(text(), 'Dashboard Finansowy')]")
        ));
        assertTrue(header.isDisplayed(), "Nagłówek Dashboardu powinien być widoczny");

        WebElement totalBalanceCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h6[contains(text(), 'Suma środków') or contains(., 'Suma')] | //*[contains(text(), 'Suma środków')]")
        ));
        assertTrue(totalBalanceCard.isDisplayed(), "Karta z sumą środków powinna być widoczna");
    }

    @Test
    public void testChartsAreRendered() {
        WebElement pieChartHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(), 'Wydatki według kategorii')]")
        ));
        assertTrue(pieChartHeader.isDisplayed(), "Nagłówek wykresu kołowego powinien być widoczny");

        WebElement barChartHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(), 'Wydatki tygodniowe')]")
        ));
        assertTrue(barChartHeader.isDisplayed(), "Nagłówek wykresu słupkowego powinien być widoczny");

        WebElement chartContainer = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.cssSelector(".recharts-wrapper")
        ));
        assertTrue(chartContainer.isDisplayed(), "Wykres z biblioteki Recharts powinien zostać wyrenderowany");
    }

    @Test
    public void testWidgetsAreLoaded() {
        WebElement healthScoreWidget = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h6[contains(text(), 'Zdrowie Finansowe')]")
        ));
        assertTrue(healthScoreWidget.isDisplayed(), "Widget HealthScore powinien być widoczny");

        WebElement auditorWidget = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(), 'Struktura Wydatków')]")
        ));
        assertTrue(auditorWidget.isDisplayed(), "Widget Auditor powinien być widoczny");

    }

    @Test
    public void testRecentTransactionsList() {
        WebElement recentTransactionsHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h6[contains(text(), 'Ostatnie transakcje')]")
        ));
        assertTrue(recentTransactionsHeader.isDisplayed(), "Sekcja ostatnich transakcji powinna być widoczna");

        WebElement listElement = driver.findElement(By.cssSelector("ul.MuiList-root"));
        assertTrue(listElement.isDisplayed(), "Lista ostatnich transakcji powinna być widoczna");
    }
}