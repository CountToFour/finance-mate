package com.financemate.account.mapper;

import com.financemate.account.dto.AccountResponse;
import com.financemate.account.model.Account;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    AccountResponse accountToDto(Account entity);
}
