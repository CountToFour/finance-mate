package finance_mate.core.category.service;

import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.category.model.Category;
import finance_mate.core.transaction.model.TransactionType;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto dto, String userId);
    CategoryDto updateCategory(String id, CategoryDto dto, String userId);
    void deleteCategory(String id, String userId);
    List<CategoryDto> getUserCategories(String userId, TransactionType type);

    Optional<Category> findById(String id);

    List<Category> findAllByUser(String userId);
}
