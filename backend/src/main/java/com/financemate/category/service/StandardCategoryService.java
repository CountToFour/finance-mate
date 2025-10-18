package com.financemate.category.service;

import com.financemate.category.exceptions.CategoryTypeMismatchException;
import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.UserRepository;
import com.financemate.category.dto.CategoryDto;
import com.financemate.category.exceptions.CategoryNotFoundExcpetion;
import com.financemate.category.mapper.CategoryMapper;
import com.financemate.category.model.Category;
import com.financemate.category.model.CategoryLocale;
import com.financemate.category.repository.CategoryRepository;
import com.financemate.transaction.model.TransactionType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StandardCategoryService implements  CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    private static final Map<String, Map<CategoryLocale, String>> DEFAULT_CATEGORIES = Map.of(
        "FOOD", Map.of(
            CategoryLocale.PL, "Jedzenie",
            CategoryLocale.EN, "Food"
        ),
        "TRANSPORT", Map.of(
            CategoryLocale.PL, "Transport",
            CategoryLocale.EN, "Transport"
        ),
        "HOUSING", Map.of(
            CategoryLocale.PL, "Mieszkanie",
            CategoryLocale.EN, "Housing"
        ),
        "ENTERTAINMENT", Map.of(
            CategoryLocale.PL, "Rozrywka",
            CategoryLocale.EN, "Entertainment"
        ),
        "SALARY", Map.of(
            CategoryLocale.PL, "Wynagrodzenie",
            CategoryLocale.EN, "Salary"
        ),
        "INVESTMENTS", Map.of(
            CategoryLocale.PL, "Inwestycje",
            CategoryLocale.EN, "Investments"
        ),
        "GIFTS", Map.of(
            CategoryLocale.PL, "Prezenty",
            CategoryLocale.EN, "Gifts"
        )
    );

    private static final Map<String, String> CATEGORY_COLORS = Map.of(
        "FOOD", "#FF5733",
        "TRANSPORT", "#33FF57",
        "HOUSING", "#3357FF",
        "ENTERTAINMENT", "#FF33F5",
        "SALARY", "#33FFF5",
        "INVESTMENTS", "#F5FF33",
        "GIFTS", "#FF3333"
    );

    private static final Map<String, TransactionType> CATEGORY_TYPES = Map.of(
        "FOOD", TransactionType.EXPENSE,
        "TRANSPORT", TransactionType.EXPENSE,
        "HOUSING", TransactionType.EXPENSE,
        "ENTERTAINMENT", TransactionType.EXPENSE,
        "SALARY", TransactionType.INCOME,
        "INVESTMENTS", TransactionType.INCOME,
        "GIFTS", TransactionType.INCOME
    );

    @PostConstruct
    public void initializeDefaultCategories() {
        if (categoryRepository.findByIsDefaultTrue().isEmpty()) {
            createDefaultCategories();
        }
    }

    private void createDefaultCategories() {
        DEFAULT_CATEGORIES.forEach((key, translations) -> {
            translations.forEach((locale, name) -> {
                createDefaultCategory(name, CATEGORY_COLORS.get(key), CATEGORY_TYPES.get(key), locale);
            });
        });
    }

    private void createDefaultCategory(String name, String color, TransactionType type, CategoryLocale locale) {
        Category category = Category.builder()
                .name(name)
                .color(color)
                .transactionType(type)
                .locale(locale)
                .isDefault(true)
                .build();
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto dto, User user) {
        Category category = categoryMapper.mapToEntity(dto);
        category.setUser(user);

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new CategoryNotFoundExcpetion("Parent category not found"));
            if (parent.getTransactionType() != dto.getTransactionType()) {
                throw new CategoryTypeMismatchException("Parent category transaction type mismatch");
            }
            category.setParent(parent);
            category.setColor(parent.getColor());
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.mapToDto(saved);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(String id, CategoryDto dto, String userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().equals(user)) {
            throw new RuntimeException("Access denied");
        }

        category.setName(dto.getName());
        category.setColor(dto.getColor());

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
            category.setColor(parent.getColor());
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.mapToDto(saved);
    }

    @Override
    public List<CategoryDto> getUserCategories(String userId, TransactionType type) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found"));

        return categoryRepository.findByUserAndTransactionType(user, type)
                .stream()
                .map(category -> {
                    CategoryDto dto = categoryMapper.mapToDto(category);
                    if (category.getParent() != null) {
                        dto.setParentId(category.getParent().getId());
                    }
                    return dto;
                })
                .toList();
    }

    @Override
    @Transactional
    public void deleteCategory(String id, String userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.isDefault()) {
            throw new RuntimeException("Cannot delete default category");
        }

        if (!category.getUser().equals(user)) {
            throw new RuntimeException("Access denied");
        }

        categoryRepository.delete(category);
    }

}
