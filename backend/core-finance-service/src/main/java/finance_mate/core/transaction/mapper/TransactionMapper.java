package finance_mate.core.transaction.mapper;

import finance_mate.core.transaction.model.RecurringTransaction;
import finance_mate.core.transaction.model.Transaction;
import finance_mate.core.transaction.model.dto.RecurringTransactionResponse;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import finance_mate.core.transaction.model.dto.TransactionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction transactionToEntity(TransactionRequest dto);
    TransactionResponse transactionToDto(Transaction entity);
    RecurringTransaction recurringTransactionToEntity(TransactionRequest dto);
    RecurringTransactionResponse recurringTransactionToDto(RecurringTransaction entity);
}
