//package com.financemate.expenses;
//
//import com.financemate.expenses.model.Expense;
//import com.financemate.expenses.model.PeriodType;
//import com.financemate.expenses.model.RecurringExpense;
//import com.financemate.expenses.repository.ExpenseRepository;
//import com.financemate.expenses.repository.RecurringExpenseRepository;
//import com.financemate.expenses.service.RecurringExpenseService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//
//import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.times;
//import static org.mockito.Mockito.when;
//import static org.mockito.Mockito.verify;
//
//public class RecurringExpenseServiceTest {
//
//    @Mock
//    private RecurringExpenseRepository recurringExpenseRepository;
//
//    @Mock
//    private ExpenseRepository expenseRepository;
//
//    @InjectMocks
//    private RecurringExpenseService recurringExpenseService;
//
//    private RecurringExpense recurringExpense;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//        recurringExpense = new RecurringExpense();
//        recurringExpense.setId("id");
//        recurringExpense.setUserId("userId");
//        recurringExpense.setCategory("Abonament");
//        recurringExpense.setPrice(BigDecimal.valueOf(50));
//        recurringExpense.setDescription("Spotify");
//        recurringExpense.setPeriodType(PeriodType.MONTHLY);
//        recurringExpense.setExpenseDate(LocalDate.now().minusMonths(2));
//        recurringExpense.setLastGeneratedDate(LocalDate.now().minusMonths(1));
//        recurringExpense.setActive(true);
//    }
//
//    @Test
//    void shouldGenerateExpenseIfDueDateReached() {
//        when(recurringExpenseRepository.findAllByActive(true)).thenReturn(List.of(recurringExpense));
//        recurringExpenseService.generateRecurringExpenses();
//
//        ArgumentCaptor<Expense> expenseCaptor = ArgumentCaptor.forClass(Expense.class);
//        verify(expenseRepository, times(1)).save(expenseCaptor.capture());
//
//        Expense savedExpense = expenseCaptor.getValue();
//        assertThat(savedExpense.getCategory()).isEqualTo("Abonament");
//        assertThat(savedExpense.getPrice()).isEqualTo(BigDecimal.valueOf(50));
//
//        ArgumentCaptor<RecurringExpense> recurringCaptor = ArgumentCaptor.forClass(RecurringExpense.class);
//        verify(recurringExpenseRepository, times(1)).save(recurringCaptor.capture());
//        assertThat(recurringCaptor.getValue().getLastGeneratedDate()).isEqualTo(LocalDate.now());
//    }
//
//    @Test
//    void shouldNotGenerateExpenseIfEndDatePassed() {
//        when(recurringExpenseRepository.findAllByActive(true)).thenReturn(List.of());
//        recurringExpenseService.generateRecurringExpenses();
//        verify(expenseRepository, never()).save(any());
//    }
//
//    @Test
//    void shouldNotDuplicateExpenseIfAlreadyGeneratedToday() {
//        recurringExpense.setLastGeneratedDate(LocalDate.now());
//        when(recurringExpenseRepository.findAllByActive(true)).thenReturn(List.of(recurringExpense));
//        recurringExpenseService.generateRecurringExpenses();
//        verify(expenseRepository, never()).save(any());
//    }
//}
