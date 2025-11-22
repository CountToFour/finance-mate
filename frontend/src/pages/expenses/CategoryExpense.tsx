import React from "react";
import type {CategoryAmount} from "../../lib/types.ts";
import {Box, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

interface CategoryExpenseProps {
    categoryAmount: CategoryAmount;
    color?: string;
}

const CategoryExpense: React.FC<CategoryExpenseProps> = ({categoryAmount, color}) => {
    const {t} = useTranslation();

    return (
        <Box sx={{border: 3, borderColor: color, borderRadius: 1.5, p: 2, display: 'flex', gap: 1.5}}>
            <Box sx={{width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Box sx={{width: 15, height: 15, borderRadius: '50%', bgcolor: color}}/>
            </Box>
            <Box sx={{flex: 1}}>
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
                                color={"text.secondary"}>{(categoryAmount.percentage * 100).toFixed(2)} %</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default CategoryExpense