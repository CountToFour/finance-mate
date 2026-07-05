package finance_mate.core.category.model.dto;

import finance_mate.core.category.model.CategoryGroup;
import finance_mate.core.transaction.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponse {
    private String id;
    private String name;
    private String color;
    private String parentId;
    private TransactionType transactionType;
    private CategoryGroup categoryGroup;
}
