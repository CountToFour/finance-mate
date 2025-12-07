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
    
    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <Box 
        sx={{
            borderRadius: 2,
            p: 2, 
            display: 'flex', 
            gap: 1.5,
            background: `linear-gradient(to bottom right, ${hexToRgba(color, 0.3)}, #FFFFFF)`,
            border: '1px solid',
            borderColor: 'divider',
            }}
            >
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