package finance_mate.core.category.model;

import finance_mate.core.transaction.model.TransactionType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DefaultCategories {
    FOOD("Food", "#FF5733", TransactionType.EXPENSE, CategoryGroup.NEEDS),
    TRANSPORT("Transport", "#33FF57", TransactionType.EXPENSE, CategoryGroup.NEEDS),
    HOUSING("Housing", "#3357FF", TransactionType.EXPENSE, CategoryGroup.NEEDS),
    ENTERTAINMENT("Entertainment", "#FF33F5", TransactionType.EXPENSE, CategoryGroup.WANTS),
    SALARY("Salary", "#33FFF5", TransactionType.INCOME, null),
    INVESTMENTS("Investments", "#F5FF33", TransactionType.INCOME, null),
    GIFTS("Gifts", "#FF3333", TransactionType.INCOME, null);

    private final String defaultName;
    private final String color;
    private final TransactionType transactionType;
    private final CategoryGroup categoryGroup;
}
