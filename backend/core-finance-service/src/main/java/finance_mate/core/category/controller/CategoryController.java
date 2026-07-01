package finance_mate.core.category.controller;

import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.transaction.model.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping()
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryDto categoryDto,
                                            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable String id,
                                                      @Valid @RequestBody CategoryDto categoryDto,
                                                      @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto, userId));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getUserCategories(@RequestParam TransactionType type,
                                                               @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(categoryService.getUserCategories(userId, type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id,
                                            @RequestHeader("X-User-Id") String userId) {
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.ok().build();
    }
}
