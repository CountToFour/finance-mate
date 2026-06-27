package finance_mate.core.category.dto;

import finance_mate.core.category.dto.validation.CorrectColorHex;
import finance_mate.core.category.model.CategoryGroup;
import finance_mate.core.transaction.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private String id;
    @NotBlank(message = "Name is mandatory")
    private String name;
    @NotBlank(message = "Color cannot be empty") @CorrectColorHex
    private String color;
    private String parentId;
    @NotNull(message = "Transaction type cannot be null")
    private TransactionType transactionType;
    private CategoryGroup categoryGroup;
}
