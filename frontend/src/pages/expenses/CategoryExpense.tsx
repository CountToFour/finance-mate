import React from "react";
import type {CategoryAmount} from "../../lib/types.ts";
import {Box, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

interface CategoryExpenseProps {
    categoryAmount: CategoryAmount;
}

const CategoryExpense: React.FC<CategoryExpenseProps> = ({categoryAmount}) => {
    const { t } = useTranslation();

    return (
        <Box sx={{border: 1, borderColor: '#8c8c8c', borderRadius: 1, p: 2}}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1"
                            fontWeight={"bold"}>{categoryAmount.category}</Typography>
                <Typography variant="subtitle1"
                            fontWeight={"bold"}>{categoryAmount.amount} zł</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2"
                            color={"text.secondary"}>{categoryAmount.transactions} {t('expenses.page.categories.transaction')}</Typography>
                <Typography variant="body2"
                            color={"text.secondary"}>{categoryAmount.percentage * 100} %</Typography>
            </Box>
        </Box>
    )
}

export default CategoryExpense