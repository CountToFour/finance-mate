package finance_mate.core.transaction.service;

import finance_mate.core.account.model.Account;
import finance_mate.core.account.service.AccountService;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.exception.AccountException;
import finance_mate.core.exception.CategoryException;
import finance_mate.core.exception.ErrorCode;
import finance_mate.core.exception.TransactionException;
import finance_mate.core.transaction.mapper.TransactionMapper;
import finance_mate.core.transaction.model.PeriodType;
import finance_mate.core.transaction.model.RecurringTransaction;
import finance_mate.core.transaction.model.Transaction;
import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.EditTransactionDto;
import finance_mate.core.transaction.model.dto.RecurringTransactionResponse;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import finance_mate.core.transaction.repository.RecurringTransactionRepository;
import finance_mate.core.transaction.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class StandardRecurringTransactionService implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final TransactionMapper transactionMapper;

    @Transactional
    @Override
    public RecurringTransactionResponse addRecurringTransaction(TransactionRequest dto, String userId) {
        if (dto.getPeriodType() != PeriodType.NONE) {
            Account account = accountService.findByIdAndUserId(dto.getAccountId(), userId)
                    .orElseThrow(() -> new AccountException(ErrorCode.ACCOUNT_NOT_FOUND));
            Category category = categoryService.findById(dto.getCategoryId())
                    .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));

            if (dto.getCreatedAt().isBefore(LocalDate.now())) {
                throw new TransactionException(ErrorCode.TRANSACTION_START_EXCEPTION);
            }

            RecurringTransaction recurringTransaction = transactionMapper.recurringTransactionToEntity(dto);
            recurringTransaction.setActive(true);

            if (recurringTransaction.getTransactionType() == TransactionType.EXPENSE) {
                recurringTransaction.setPrice(-Math.abs(recurringTransaction.getPrice()));
            } else {
                recurringTransaction.setPrice(Math.abs(recurringTransaction.getPrice()));
            }

            recurringTransaction.setAccount(account);
            recurringTransaction.setUserId(userId);
            recurringTransaction.setCategory(category);
            recurringTransactionRepository.save(recurringTransaction);
            RecurringTransactionResponse savedDto = transactionMapper.recurringTransactionToDto(recurringTransaction);
            savedDto.setAccountName(account.getName());
            savedDto.setCategoryName(category.getName());
            return savedDto;
        } else {
            throw new TransactionException(ErrorCode.TRANSACTION_PERIOD_EXCEPTION);
        }
    }

    @Override
    public List<RecurringTransactionResponse> getAllRecurringTransactions(String userId, TransactionType type) {

        return recurringTransactionRepository.findAllByUserIdAndTransactionType(userId, type).stream()
                .map(transaction -> {
                    RecurringTransactionResponse dto = transactionMapper.recurringTransactionToDto(transaction);
                    dto.setAccountName(transaction.getAccount().getName());
                    dto.setCategoryName(transaction.getCategory().getName());
                    return dto;
                })
                .toList();
    }

    @Transactional
    @Override
    public void deleteRecurringTransaction(String id) {
        if (!recurringTransactionRepository.existsById(id)) {
            throw new TransactionException(ErrorCode.TRANSACTION_RECURRING_NOT_FOUND);
        }
        recurringTransactionRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void deactivateRecurringTransaction(String id) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new TransactionException(ErrorCode.TRANSACTION_RECURRING_NOT_FOUND));
        recurringTransaction.setActive(!recurringTransaction.isActive());
        recurringTransactionRepository.save(recurringTransaction);
    }

    @Transactional
    @Override
    public RecurringTransactionResponse editRecurringTransaction(String id, EditTransactionDto dto) {
        RecurringTransaction transaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new TransactionException(ErrorCode.TRANSACTION_RECURRING_NOT_FOUND));

        if (Objects.nonNull(dto.categoryId())) {
            Category category = categoryService.findById(dto.categoryId())
                    .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));
            if (!category.getName().equals(transaction.getCategory().getName())) {
                transaction.setCategory(category);
            }
        }
        if (Objects.nonNull(dto.price()) && dto.price() != Math.abs(transaction.getPrice())) {
            if (transaction.getTransactionType() == TransactionType.EXPENSE) {
                transaction.setPrice(-Math.abs(dto.price()));
            } else {
                transaction.setPrice(Math.abs(dto.price()));
            }
        }
        if (dto.description() != null && !dto.description().equals(transaction.getDescription())) {
            transaction.setDescription(dto.description());
        }
        if (dto.createdAt() != null && !dto.createdAt().equals(transaction.getCreatedAt())) {
            transaction.setCreatedAt(dto.createdAt());
        }
        if (dto.periodType() != PeriodType.NONE && dto.periodType() != transaction.getPeriodType()) {
            transaction.setPeriodType(dto.periodType());
        }
        if (dto.accountId() != null && !dto.accountId().equals(transaction.getAccount().getId())) {
            Account account = accountService.findByIdAndUserId(dto.accountId(), transaction.getUserId())
                    .orElseThrow(() -> new AccountException(ErrorCode.ACCOUNT_NOT_FOUND));
            transaction.setAccount(account);
        }
        recurringTransactionRepository.save(transaction);
        return transactionMapper.recurringTransactionToDto(transaction);
    }

    @Scheduled(cron = "0 21 22 * * ?")
    @Transactional
    @Override
    public void generateRecurringExpenses() {

        LocalDate today = LocalDate.now().plusDays(0);

        List<Transaction> transactionsToSave = new ArrayList<>();
        List<RecurringTransaction> recurringToUpdate = new ArrayList<>();
        List<RecurringTransaction> recurringToDelete = new ArrayList<>();

        for (RecurringTransaction recurring : recurringTransactionRepository.findAllByActive(true)) {

            LocalDate nextDate = recurring.getCreatedAt();

            if (today.isAfter(nextDate) || today.equals(nextDate)) {
                Transaction transaction = new Transaction();
                transaction.setUserId(recurring.getUserId());
                transaction.setCategory(recurring.getCategory());
                transaction.setPrice(recurring.getPrice());
                transaction.setCreatedAt(nextDate);
                transaction.setDescription(recurring.getDescription());
                transaction.setTransactionType(recurring.getTransactionType());
                transaction.setAccount(recurring.getAccount());
                transactionsToSave.add(transaction);

                if (recurring.getPeriodType() == PeriodType.ONCE) {
                    recurringToDelete.add(recurring);
                } else {
                    recurring.setCreatedAt(calculateNextDate(nextDate, recurring.getPeriodType()));
                    recurringToUpdate.add(recurring);
                }
            }
        }

        if (!transactionsToSave.isEmpty()) {
            transactionRepository.saveAll(transactionsToSave);
        }
        if (!recurringToUpdate.isEmpty()) {
            recurringTransactionRepository.saveAll(recurringToUpdate);
        }
        if (!recurringToDelete.isEmpty()) {
            recurringTransactionRepository.deleteAll(recurringToDelete);
        }
    }

    private LocalDate calculateNextDate(LocalDate baseDate, PeriodType type) {
        return switch (type) {
            case DAILY -> baseDate.plusDays(1);
            case WEEKLY -> baseDate.plusWeeks(1);
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY -> baseDate.plusYears(1);
            default -> baseDate;
        };
    }
}
