package finance_mate.core.category.service;

import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.category.mapper.CategoryMapper;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.CategoryGroup;
import finance_mate.core.category.model.CategoryLocale;
import finance_mate.core.category.repository.CategoryRepository;
import finance_mate.core.exception.CategoryException;
import finance_mate.core.exception.ErrorCode;
import finance_mate.core.transaction.model.TransactionType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandardCategoryService implements CategoryService {

    private final CategoryRepository categoryRepository;
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

    private static final Map<String, CategoryGroup> CATEGORY_GROUPS = Map.of(
            "FOOD", CategoryGroup.NEEDS,
            "TRANSPORT", CategoryGroup.NEEDS,
            "HOUSING", CategoryGroup.NEEDS,
            "ENTERTAINMENT", CategoryGroup.WANTS
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
                CategoryGroup group = CATEGORY_GROUPS.getOrDefault(key, null);
                createDefaultCategory(name, CATEGORY_COLORS.get(key), CATEGORY_TYPES.get(key), locale, group);
            });
        });
    }

    private void createDefaultCategory(String name, String color, TransactionType type, CategoryLocale locale, CategoryGroup group) {
        Category category = Category.builder()
                .name(name)
                .color(color)
                .transactionType(type)
                .locale(locale)
                .isDefault(true)
                .categoryGroup(group)
                .build();
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto dto, String userId) {
        if (dto.getCategoryGroup() == null && dto.getTransactionType() == TransactionType.EXPENSE) {
            throw new CategoryException(ErrorCode.CATEGORY_TYPE_MISMATCH);
        }

        Category category = categoryMapper.mapToEntity(dto);
        category.setUserId(userId);

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> {
                        log.error("Parent category not found for id: {}", dto.getParentId());
                        return new CategoryException(ErrorCode.CATEGORY_NOT_FOUND);
                    });
            if (parent.getTransactionType() != dto.getTransactionType()) {
                throw new CategoryException(ErrorCode.CATEGORY_TYPE_MISMATCH);
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
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.getUserId() == null || !category.getUserId().equals(userId)) {
            throw new CategoryException(ErrorCode.CATEGORY_ACCESS_DENIED);
        }

        category.setName(dto.getName());
        category.setColor(dto.getColor());
        category.setCategoryGroup(dto.getCategoryGroup());

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> {
                        log.error("Parent category not found for id: {}", dto.getParentId());
                        return new CategoryException(ErrorCode.CATEGORY_NOT_FOUND);
                    });
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
        return categoryRepository.findByUserIdAndTransactionType(userId, type)
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
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.isDefault()) {
            throw new CategoryException(ErrorCode.CATEGORY_DELETE);
        }

        if (category.getUserId() == null || !category.getUserId().equals(userId)) {
            throw new CategoryException(ErrorCode.CATEGORY_ACCESS_DENIED);
        }

        categoryRepository.delete(category);
    }

    @Override
    public Optional<Category> findById(String id) {
        return categoryRepository.findById(id);
    }

    @Override
    public List<Category> findAllByUser(String userId) {
        return categoryRepository.findAllByUserId(userId);
    }

}
