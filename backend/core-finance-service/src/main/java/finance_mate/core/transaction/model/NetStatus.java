package finance_mate.core.transaction.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "net_status")
@NoArgsConstructor
public class NetStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String userId;
    @Enumerated(EnumType.STRING)
    private SafetyNetStatus safetyNetStatus;
    private double monthsOfSafety;

}
