package com.financemate.category.service;

import com.financemate.auth.model.user.User;
import com.financemate.category.dto.CategoryDto;
import com.financemate.transaction.model.TransactionType;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto dto, User user);
    CategoryDto updateCategory(String id, CategoryDto dto, String userId);
    void deleteCategory(String id, String userId);
    List<CategoryDto> getUserCategories(String userId, TransactionType type);
}
