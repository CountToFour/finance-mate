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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class BudgetTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("http://localhost:5173/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.name("email"))).sendKeys("user2@email.com");
        driver.findElement(By.name("password")).sendKeys("testtest");
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        driver.get("http://localhost:5173/budgets");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h5[contains(text(), 'Budżet')]")));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testBudgetPageLoadsCorrectly() {
        WebElement summaryCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h6[contains(text(), 'Budżet wg kategorii')]")
        ));
        assertTrue(summaryCard.isDisplayed(), "Sekcja 'Budżet wg kategorii' powinna być widoczna");

        assertTrue(driver.findElement(By.xpath("//button[contains(., 'Dodaj cel')]")).isDisplayed());
        assertTrue(driver.findElement(By.xpath("//button[contains(., 'Ustaw budżet')]")).isDisplayed());

        List<WebElement> summaryCards = driver.findElements(By.cssSelector("[data-testid='summary-card']"));
        assertTrue(!summaryCards.isEmpty(), "Karty podsumowań powinny być wyrenderowane");

        WebElement budgets = driver.findElement(By.cssSelector("[data-testId='budget-by-category']"));
        assertTrue(budgets.isDisplayed(), "Komponent z budżetami powinien być wyrenderowany");

        WebElement investment = driver.findElement(By.cssSelector("[data-testId='investment-widget']"));
        assertTrue(investment.isDisplayed(), "Komponent z rekomendacjami inwestycji pownien być wyrenderowany");

        WebElement goals = driver.findElement(By.cssSelector("[data-testId='goals-card']"));
        assertTrue(goals.isDisplayed(), "Komponent z celami powinien być wyrenderowany");
    }

    @Test
    public void testEmptyBudgetFormValidation() {
        WebElement setBudgetBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Ustaw budżet')]")
        ));
        setBudgetBtn.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement submitButton = dialog.findElement(By.xpath(".//button[contains(., 'Utwórz')]"));
        submitButton.click();

        WebElement limitInput = dialog.findElement(By.cssSelector("input[type='number']"));
        assertEquals("true", limitInput.getAttribute("aria-invalid"), "Pole limitu powinno być podświetlone jako błędne");

        dialog.findElement(By.xpath(".//button[contains(., 'Anuluj')]")).click();
    }

    @Test
    public void testEmptyGoalFormValidation() {
        WebElement addGoalBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid='add-goal-button']")
        ));
        addGoalBtn.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement submitButton = dialog.findElement(By.xpath(".//button[contains(., 'Utwórz cel')]"));
        submitButton.click();

        assertTrue(dialog.isDisplayed(), "Okno celu finansowego powinno pozostać otwarte z powodu błędów walidacji");

        dialog.findElement(By.xpath(".//button[contains(., 'Anuluj')]")).click();
    }

    @Test
    public void testAddNewBudgetSuccessfullyAndVerifyList() {
        WebElement setBudgetBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Ustaw budżet')]")
        ));
        setBudgetBtn.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        String limitValue = "1500";
        WebElement limitInput = dialog.findElement(By.cssSelector("input[type='number']"));
        limitInput.sendKeys(limitValue);

        List<WebElement> comboboxes = dialog.findElements(By.cssSelector("div[role='combobox']"));
        WebElement categorySelect = comboboxes.get(1);
        categorySelect.click();

        WebElement firstCategoryOption = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("ul[role='listbox'] li[role='option']")));

        String selectedCategoryName = firstCategoryOption.getText();
        firstCategoryOption.click();

        WebElement submitButton = dialog.findElement(By.xpath(".//button[contains(., 'Utwórz')]"));
        submitButton.click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement newBudgetCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(@class, 'MuiCardContent-root') and contains(., '" + selectedCategoryName + "') and contains(., '" + limitValue + "')]")
        ));

        assertTrue(newBudgetCard.isDisplayed(), "Karta dodanego budżetu powinna być widoczna na liście podsumowań");
    }

    @Test
    public void testAddNewFinancialGoalSuccessfully() {
        WebElement addGoalBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid='add-goal-button']")
        ));
        addGoalBtn.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement nameInput = dialog.findElement(By.xpath(".//label[text()='Nazwa celu']/following-sibling::div/input"));
        String goalName = "Nowy Laptop E2E " + System.currentTimeMillis();
        nameInput.sendKeys(goalName);

        dialog.findElement(By.xpath(".//label[text()='Kwota docelowa']/following-sibling::div/input")).sendKeys("5000");

        dialog.findElement(By.xpath(".//button[contains(., 'Utwórz cel')]")).click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement newGoalCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(@class, 'MuiCardContent-root')]//h6[contains(text(), '" + goalName + "')]")
        ));
        assertTrue(newGoalCard.isDisplayed(), "Karta nowego celu finansowego powinna być widoczna na pulpicie");
    }
}