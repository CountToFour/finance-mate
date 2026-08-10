package finance_mate.budget.mapper;

import finance_mate.budget.model.FinancialGoal;
import finance_mate.budget.model.dto.FinancialGoalDto;
import finance_mate.budget.model.dto.FinancialGoalResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FinancialGoalMapper {
    FinancialGoalResponseDto mapGoalToDto(FinancialGoal financialGoal);
    FinancialGoal mapDtoToGoal(FinancialGoalDto dto);
}
