package com.financemate.recommendation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "recommendations")
public class RecommendationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "jsonb")
    private String payload;

    private String modelVersion;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    public enum Status { NEW, SHOWN, ACCEPTED, REJECTED }
}
