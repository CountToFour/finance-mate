package finance_mate.core.category.repository;

import finance_mate.core.category.model.DefaultCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultCategoryRepository extends JpaRepository<DefaultCategory, String> {
    boolean existsByCode(String code);
}
