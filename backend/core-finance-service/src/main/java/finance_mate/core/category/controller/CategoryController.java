package finance_mate.core.category.controller;

import finance_mate.core.category.dto.CategoryDto;
import finance_mate.core.category.exceptions.CategoryNotFoundExcpetion;
import finance_mate.core.category.exceptions.CategoryTypeMismatchException;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.transaction.model.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping()
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryDto categoryDto,
                                            @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(categoryService.createCategory(categoryDto, userId));
        } catch (CategoryNotFoundExcpetion e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (CategoryTypeMismatchException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
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
