import {ArrowDropDownIcon} from "@mui/x-date-pickers";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {Box, ListItem, Typography} from "@mui/material";

type Props = {
    categoryName: string,
    currentAmount: number,
    previousAmount: number,
    changePercent: number,
    isIncrease: boolean
    currency?: string
}

const CategoryTrendItem: React.FC<Props> = ({ categoryName, currentAmount, previousAmount, changePercent, isIncrease, currency}) => {

    let changeColor = 'text.secondary';
    let ChangeIcon = null;

    if (changePercent > 0) {
        changeColor = isIncrease ? 'error.main' : 'success.main';
        ChangeIcon = isIncrease ? ArrowDropUpIcon : ArrowDropDownIcon;
    }

    const formatAmount = (amount: number) =>
        amount.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ` ${currency || ''}`;

    return (
        <ListItem
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                py: 2,
                px: 0,
                borderBottom: '1px solid #eee',
                '&:last-child': { borderBottom: 'none' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                <Typography variant="body1" fontWeight="medium" sx={{ color: '#444' }}>
                    {categoryName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '200px', justifyContent: 'flex-end' }}>

                    <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
                        {formatAmount(currentAmount)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', color: changeColor, fontSize: '0.875rem' }}>
                        {ChangeIcon && <ChangeIcon sx={{ fontSize: '1.2rem' }} />}
                        {changePercent > 0 ? `${changePercent}%` : '0%'}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3, width: '40px', textAlign: 'right' }}>
                        {formatAmount(previousAmount)}
                    </Typography>
                </Box>
            </Box>

        </ListItem>
    );
};

export default CategoryTrendItem;