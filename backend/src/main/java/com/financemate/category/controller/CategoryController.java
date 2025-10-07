package com.financemate.category.controller;

import com.financemate.auth.service.UserService;
import com.financemate.category.dto.CategoryDto;
import com.financemate.category.service.CategoryService;
import com.financemate.transaction.model.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final UserService userService;

    @PostMapping("/{userId}")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto,
                                                      @PathVariable String userId) {
//        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(categoryService.createCategory(categoryDto, userId));
    }

    @PutMapping("/{id}/{userId}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable String id,
                                                      @PathVariable String userId,
                                                      @Valid @RequestBody CategoryDto categoryDto) {
//        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto, userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CategoryDto>> getUserCategories(@PathVariable String userId,
                                                               @RequestParam TransactionType type) {
//        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(categoryService.getUserCategories(userId, type));
    }
}
