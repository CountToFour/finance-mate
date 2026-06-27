package finance_mate.core.category.mapper;


import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.category.model.Category;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category mapToEntity(CategoryDto dto);
    CategoryDto mapToDto(Category entity);
}

