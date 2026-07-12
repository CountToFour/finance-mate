package finance_mate.core.category.service;

import finance_mate.core.category.model.dto.CategoryDto;
import finance_mate.core.category.mapper.CategoryMapper;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.DefaultCategories;
import finance_mate.core.category.model.DefaultCategory;
import finance_mate.core.category.model.dto.CategoryResponse;
import finance_mate.core.category.model.dto.SubCategoryDto;
import finance_mate.core.category.repository.CategoryRepository;
import finance_mate.core.category.repository.DefaultCategoryRepository;
import finance_mate.core.exception.CategoryException;
import finance_mate.core.exception.ErrorCode;
import finance_mate.core.transaction.model.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandardCategoryService implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final CategoryRepository categoryRepository;
    private final DefaultCategoryRepository defaultCategoryRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDefaultCategories() {
        log.info("Started default categories verification...");

        int addedCount = 0;
        for (DefaultCategories categoryEnum : DefaultCategories.values()) {
            String code = categoryEnum.name();
            if (!defaultCategoryRepository.existsByCode(code)) {

                DefaultCategory newCategory = DefaultCategory.builder()
                        .code(code)
                        .name(categoryEnum.getDefaultName())
                        .color(categoryEnum.getColor())
                        .transactionType(categoryEnum.getTransactionType())
                        .categoryGroup(categoryEnum.getCategoryGroup())
                        .build();

                defaultCategoryRepository.save(newCategory);
                addedCount++;
                log.info("Default category saved to database: {}", code);
            }
        }

        if (addedCount > 0) {
            log.info("Finished initialization. Added new categories: {}", addedCount);
        } else {
            log.info("Initialization completed. All default categories already exist.");
        }
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryDto dto, String userId) {
        if (dto.getCategoryGroup() == null && dto.getTransactionType() == TransactionType.EXPENSE) {
            throw new CategoryException(ErrorCode.CATEGORY_TYPE_MISMATCH);
        }

        Category category = categoryMapper.mapToEntity(dto);
        category.setUserId(userId);

        Category saved = categoryRepository.save(category);
        return categoryMapper.mapToDto(saved);
    }

    @Transactional
    @Override
    public CategoryResponse createSubCategory(SubCategoryDto dto, String userId) {
        Category parentCategory = categoryRepository.findById(dto.getParentId())
                .orElseThrow(() -> {
                    log.error("Parent category not found for id: {}", dto.getParentId());
                    return new CategoryException(ErrorCode.CATEGORY_NOT_FOUND);
                });

        Category category = Category.builder()
                .name(dto.getName())
                .color(parentCategory.getColor())
                .parent(parentCategory)
                .userId(userId)
                .transactionType(parentCategory.getTransactionType())
                .categoryGroup(parentCategory.getCategoryGroup())
                .build();

        Category saved = categoryRepository.save(category);
        CategoryResponse response = categoryMapper.mapToDto(saved);
        response.setParentId(parentCategory.getId());
        return response;
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(String id, CategoryDto dto, String userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.getUserId() == null || !category.getUserId().equals(userId)) {
            throw new CategoryException(ErrorCode.CATEGORY_ACCESS_DENIED);
        }

        category.setName(dto.getName());
        category.setCategoryGroup(dto.getCategoryGroup());
        if (category.getParent() != null) {
            category.setColor(category.getParent().getColor());
        } else {
            category.setColor(dto.getColor());
        }
        Category saved = categoryRepository.save(category);
        return categoryMapper.mapToDto(saved);
    }

    @Override
    public List<CategoryResponse> getUserCategories(String userId) {
        return categoryRepository.findAllByUserId(userId)
                .stream()
                .map(category -> {
                    CategoryResponse dto = categoryMapper.mapToDto(category);
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

    @Override
    public void assignCategoriesToUser(String userId) {
        List<DefaultCategory> defaultCategories = defaultCategoryRepository.findAll();
        for (DefaultCategory defaultCategory : defaultCategories) {
            Category category = Category.builder()
                    .name(defaultCategory.getName())
                    .color(defaultCategory.getColor())
                    .transactionType(defaultCategory.getTransactionType())
                    .categoryGroup(defaultCategory.getCategoryGroup())
                    .userId(userId)
                    .build();
            categoryRepository.save(category);
        }
    }

}
