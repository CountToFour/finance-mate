package finance_mate.budget.mapper;

import finance_mate.budget.model.Budget;
import finance_mate.budget.model.dto.BudgetDto;
import finance_mate.budget.model.dto.BudgetResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BudgetMapper {
    Budget mapDtoToBudget(BudgetDto budget);
    BudgetResponseDto mapBudgetToResponseDto(Budget budget);
}
