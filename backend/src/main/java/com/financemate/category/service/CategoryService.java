package com.financemate.category.service;

import com.financemate.auth.model.user.User;
import com.financemate.category.dto.CategoryDto;
import com.financemate.transaction.model.TransactionType;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto dto, User user);
    CategoryDto updateCategory(String id, CategoryDto dto, User user);
    void deleteCategory(String id, User user);
    List<CategoryDto> getUserCategories(User user, TransactionType type);
}
