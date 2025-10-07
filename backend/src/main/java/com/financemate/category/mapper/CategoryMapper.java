package com.financemate.category.mapper;

import com.financemate.category.dto.CategoryDto;
import com.financemate.category.model.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category mapToEntity(CategoryDto dto);
    CategoryDto mapToDto(Category entity);
}

