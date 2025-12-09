package com.financemate.category.repository;

import com.financemate.auth.model.user.User;
import com.financemate.category.model.Category;
import com.financemate.category.model.CategoryLocale;
import com.financemate.transaction.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByUserAndTransactionType(User user, TransactionType type);
    List<Category> findByUserAndParentIsNull(User user);
    List<Category> findByUserAndParent(User user, Category parent);
    List<Category> findByIsDefaultTrue();
    List<Category> findByIsDefaultTrueAndLocale(CategoryLocale locale);
    Optional<Category> findByUserAndName(User user, String name);
    List<Category> findAllByUser(User user);
}
