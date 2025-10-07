package com.financemate.category.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = ColorHexValidator.class)
@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface CorrectColorHex {
    String message() default "Color must be in hex format, e.g. #FFFFFF";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
