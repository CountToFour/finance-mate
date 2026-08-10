package finance_mate.core.category.controller;

import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.dto.CategoryDto;
import finance_mate.core.category.model.dto.CategoryResponse;
import finance_mate.core.category.model.dto.SubCategoryDto;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.transaction.model.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping()
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryDto categoryDto,
                                                           @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDto, userId));
    }

    @PostMapping("/sub-category")
    public ResponseEntity<CategoryResponse> createSubCategory(@Valid @RequestBody SubCategoryDto categoryDto,
                                                              @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.createSubCategory(categoryDto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable String id,
                                                      @Valid @RequestBody CategoryDto categoryDto,
                                                      @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto, userId));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getUserCategories(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.getUserCategories(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id,
                                            @RequestHeader("X-User-Id") String userId) {
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.ok().build();
    }
}
