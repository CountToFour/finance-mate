package finance_mate.core.category.mapper;


import finance_mate.core.category.model.dto.CategoryDto;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.dto.CategoryResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category mapToEntity(CategoryDto dto);
    CategoryResponse mapToDto(Category entity);
}

