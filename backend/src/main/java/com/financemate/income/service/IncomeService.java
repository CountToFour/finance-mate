package com.financemate.income.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.income.dto.IncomeDto;
import com.financemate.income.mapper.IncomeMapper;
import com.financemate.income.model.Income;
import com.financemate.income.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final IncomeMapper incomeMapper;
    private final UserRepository userRepository;

    public Income addIncome(IncomeDto dto) {
        userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + dto.getUserId()));

        Income income = incomeMapper.incomeToEntity(dto);
        return incomeRepository.save(income);
    }

    public List<IncomeDto> getUserIncomes(String userId) {
        return incomeRepository.findByUserId(userId)
                .stream()
                .map(incomeMapper::incomeToDto)
                .toList();
    }

    public void deleteIncome(String incomeId) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new IllegalArgumentException("Income not found with id: " + incomeId));
        incomeRepository.delete(income);
    }
}
