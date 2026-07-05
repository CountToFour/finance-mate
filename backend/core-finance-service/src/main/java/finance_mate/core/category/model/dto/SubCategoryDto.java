package finance_mate.core.category.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubCategoryDto {

    @NotBlank(message = "Name is mandatory")
    private String name;
    @NotBlank(message = "Parent is mandatory")
    private String parentId;
}
