package com.financemate.expenses.mapper;

import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.model.RecurringExpense;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {
    Expense expenseToEntity(ExpenseDto dto);
    ExpenseDto expenseToDto(Expense entity);
    RecurringExpense recurringExpenseToEntity(ExpenseDto dto);
}
