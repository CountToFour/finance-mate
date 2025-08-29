package com.financemate.expenses.mapper;

import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.model.Expense;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {
    Expense toEntity(ExpenseDto dto);
    ExpenseDto toDto(Expense entity);
}
