package com.financemate.income.mapper;

import com.financemate.income.dto.IncomeDto;
import com.financemate.income.model.Income;
import com.financemate.income.model.RecurringIncome;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IncomeMapper {
    Income incomeToEntity(IncomeDto income);
    IncomeDto incomeToDto(Income income);
    RecurringIncome recurringIncomeToEntity(IncomeDto income);
    IncomeDto recurringIncomeToDto(RecurringIncome income);
}
