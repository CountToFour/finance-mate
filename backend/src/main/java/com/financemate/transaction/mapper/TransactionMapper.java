package com.financemate.transaction.mapper;

import com.financemate.transaction.dto.TransactionDto;
import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.RecurringTransaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction transactionToEntity(TransactionDto dto);
    TransactionDto transactionToDto(Transaction entity);
    RecurringTransaction recurringTransactionToEntity(TransactionDto dto);
    TransactionDto recurringTransactionToDto(RecurringTransaction entity);
}
