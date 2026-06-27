package finance_mate.core.category.repository;

import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.CategoryLocale;
import finance_mate.core.transaction.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByUserIdAndTransactionType(String userId, TransactionType type);
    List<Category> findByUserIdAndParentIsNull(String userId);
    List<Category> findByUserIdAndParent(String userId, Category parent);
    List<Category> findByIsDefaultTrue();
    List<Category> findByIsDefaultTrueAndLocale(CategoryLocale locale);
    Optional<Category> findByUserIdAndName(String userId, String name);
    List<Category> findAllByUserId(String userId);
}
