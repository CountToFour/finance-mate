package com.financemate.budget.mapper;

import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.model.Budget;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BudgetMapper {
    BudgetDto mapToDto(Budget budget);
}
