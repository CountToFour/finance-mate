package finance_mate.core.account.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "accounts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String description;
    private String userId;
//    @ManyToOne
//    @JoinColumn(name = "currency_id", referencedColumnName = "code", nullable = false)
//    private Currency currencyCode;
    private double balance;
    private String color;
    private boolean includeInStats;
    private boolean archived;

}
