package com.financemate.transaction.mapper;

import com.financemate.transaction.dto.RecurringTransactionResponse;
import com.financemate.transaction.dto.TransactionRequest;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.RecurringTransaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction transactionToEntity(TransactionRequest dto);
    TransactionResponse transactionToDto(Transaction entity);
    RecurringTransaction recurringTransactionToEntity(TransactionRequest dto);
    RecurringTransactionResponse recurringTransactionToDto(RecurringTransaction entity);
}
