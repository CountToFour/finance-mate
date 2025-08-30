package com.financemate.income.mapper;

import com.financemate.income.dto.IncomeDto;
import com.financemate.income.model.Income;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IncomeMapper {
    Income incomeToEntity(IncomeDto income);
    IncomeDto incomeToDto(Income income);
}
