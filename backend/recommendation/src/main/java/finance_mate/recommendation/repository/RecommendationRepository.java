package finance_mate.recommendation.repository;

import finance_mate.recommendation.model.RsiRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<RsiRecommendation, String> {
    boolean existsBySymbol(String symbol);
    Optional<RsiRecommendation> findBySymbol(String symbol);
    List<RsiRecommendation> findAllBySymbolIn(List<String> symbols);
}
