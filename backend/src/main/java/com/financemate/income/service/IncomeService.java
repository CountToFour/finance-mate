package com.financemate.income.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.expenses.model.PeriodType;
import com.financemate.income.dto.IncomeDto;
import com.financemate.income.mapper.IncomeMapper;
import com.financemate.income.model.Income;
import com.financemate.income.model.RecurringIncome;
import com.financemate.income.repository.IncomeRepository;
import com.financemate.income.repository.RecurringIncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final RecurringIncomeRepository recurringIncomeRepository;
    private final IncomeMapper incomeMapper;
    private final UserRepository userRepository;

    public Income addIncome(IncomeDto dto) {
        if (dto.getPeriodType() != PeriodType.NONE) {
            RecurringIncome recurringIncome = incomeMapper.recurringIncomeToEntity(dto);
            recurringIncome.setActive(true);
            recurringIncome.setLastGeneratedDate(dto.getDate());
            recurringIncomeRepository.save(recurringIncome);
        }

        userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + dto.getUserId()));

        Income income = incomeMapper.incomeToEntity(dto);
        if (income.getDate() == null) {
            income.setDate(LocalDate.now());
        }
        return incomeRepository.save(income);
    }

    public List<IncomeDto> getUserIncomes(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return incomeRepository.findByUserId(userId)
                .stream()
                .map(incomeMapper::incomeToDto)
                .toList();
    }

    public List<IncomeDto> getAllRecurringIncomes(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return recurringIncomeRepository.findAllByUserId(userId)
                .stream()
                .map(incomeMapper::recurringIncomeToDto)
                .toList();
    }

    public void deleteIncome(String incomeId) {
        try {
            Income income = incomeRepository.findById(incomeId)
                    .orElseThrow(() -> new IllegalArgumentException("Income not found with id: " + incomeId));
            incomeRepository.delete(income);
        } catch (IllegalArgumentException e) {
            RecurringIncome recurringIncome = recurringIncomeRepository.findById(incomeId)
                    .orElseThrow(() -> new IllegalArgumentException("Income not found with id: " + incomeId));
            recurringIncomeRepository.delete(recurringIncome);
        }
    }

    public void deactivateRecurringIncome(String incomeId) {
        RecurringIncome recurringIncome = recurringIncomeRepository.findById(incomeId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring income not found with id: " + incomeId));
        recurringIncome.setActive(!recurringIncome.isActive());
        recurringIncomeRepository.save(recurringIncome);
    }

}
