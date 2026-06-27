package finance_mate.core.category.service;

import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.transaction.model.TransactionType;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto dto, String userId);
    CategoryDto updateCategory(String id, CategoryDto dto, String userId);
    void deleteCategory(String id, String userId);
    List<CategoryDto> getUserCategories(String userId, TransactionType type);
}
