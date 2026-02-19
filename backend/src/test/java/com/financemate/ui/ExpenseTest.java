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

public class ExpenseTest {

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

        driver.get("http://localhost:5173/expenses");

        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".MuiDataGrid-root")));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testExpensesPageLoadsCorrectly() {
        WebElement addButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid='add-expense-button']")
        ));
        assertTrue(addButton.isDisplayed(), "Przycisk dodawania wydatku powinien być widoczny");

        List<WebElement> summaryCards = driver.findElements(By.cssSelector("[data-testid='summary-card']"));
        assertTrue(!summaryCards.isEmpty(), "Karty podsumowań powinny być wyrenderowane");

        WebElement expensesTable = driver.findElement(By.cssSelector("[data-testId='expenses-table-card']"));
        assertTrue(expensesTable.isDisplayed(), "Tabela wydatków powinna być widoczna");

        WebElement categoriesCard = driver.findElement(By.cssSelector("[data-testId='categories-table-card']"));
        assertTrue(categoriesCard.isDisplayed(), "Komponent kategorii powinien być widoczny");

        WebElement recurringExpensesTable = driver.findElement(By.cssSelector("[data-testId='recurring-expenses-table-card']"));
        assertTrue(recurringExpensesTable.isDisplayed(), "Tabela wydatków powinna być widoczna");
    }

    @Test
    public void testAddExpenseValidation() {
        WebElement addButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid='add-expense-button']")
        ));
        addButton.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));
        assertTrue(dialog.isDisplayed(), "Okno dialogowe powinno się otworzyć");

        WebElement saveButton = dialog.findElement(By.xpath(".//button[contains(@class, 'MuiButton-containedPrimary')]"));
        saveButton.click();

        WebElement priceInput = dialog.findElement(By.cssSelector("input[type='number']"));
        assertEquals("true", priceInput.getAttribute("aria-invalid"), "Pole ceny powinno zgłaszać błąd walidacji");

        dialog.findElement(By.xpath(".//button[contains(@class, 'MuiButton-textSecondary')]")).click();
    }

    @Test
    public void testAddNewExpenseSuccessfully() {
        WebElement addButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid='add-expense-button']")
        ));
        addButton.click();

        WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement priceInput = dialog.findElement(By.cssSelector("input[type='number']"));
        priceInput.sendKeys("3.22");

        WebElement descriptionInput = dialog.findElement(By.cssSelector("[data-testid='description-input'] input"));
        String testDescription = "Zakupy spożywcze E2E " + System.currentTimeMillis();
        descriptionInput.sendKeys(testDescription);

        WebElement accountSelect = dialog.findElement(By.cssSelector("[data-testid='account-input'] div[role='combobox']"));
        accountSelect.click();

        WebElement firstAccountOption = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("ul[role='listbox'] li[role='option']")));
        firstAccountOption.click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("ul[role='listbox']")));

        WebElement categorySelect = dialog.findElement(By.cssSelector("[data-testid='category-input'] div[role='combobox']"));
        categorySelect.click();

        WebElement firstCategoryOption = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("ul[role='listbox'] li[role='option']")));
        firstCategoryOption.click();

        WebElement saveButton = dialog.findElement(By.xpath(".//button[contains(@class, 'MuiButton-containedPrimary')]"));
        saveButton.click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div[role='dialog']")));

        WebElement newExpenseRow = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//div[contains(@class, 'MuiDataGrid-row') and contains(., '" + testDescription + "')]")
        ));

        assertTrue(newExpenseRow.isDisplayed(), "Nowy wydatek powinien być widoczny w tabeli");
    }
}
