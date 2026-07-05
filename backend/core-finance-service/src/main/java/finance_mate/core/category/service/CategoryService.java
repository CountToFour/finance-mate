package finance_mate.core.category.service;

import finance_mate.core.category.model.dto.CategoryDto;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.dto.CategoryResponse;
import finance_mate.core.category.model.dto.SubCategoryDto;
import finance_mate.core.transaction.model.TransactionType;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    CategoryResponse createCategory(CategoryDto dto, String userId);

    @Transactional
    CategoryResponse createSubCategory(SubCategoryDto dto, String userId);

    CategoryResponse updateCategory(String id, CategoryDto dto, String userId);
    void deleteCategory(String id, String userId);
    List<CategoryResponse> getUserCategories(String userId, TransactionType type);
    Optional<Category> findById(String id);
    List<Category> findAllByUser(String userId);
    void assignCategoriesToUser(String userId);
}
