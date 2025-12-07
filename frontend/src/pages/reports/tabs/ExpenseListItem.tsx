import { Typography, Box, ListItem, Chip } from '@mui/material';
import type {Expense} from "../../../lib/types.ts";

type Props = {
    item: Expense,
    color: string
    currency?: string
}


const ExpenseListItem: React.FC<Props> = ({ item, color, currency }) => {

    const formattedAmount = item.price.toLocaleString('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ` ${currency || ''}`;

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const backgroundColor = hexToRgba(color, 0.2);

    return (
        <ListItem
            sx={{
                mt: 1,
                border: '1px solid #eee',
                borderRadius: 1,
                p: 1,
                '&:last-child': { borderBottom: 'none' }
            }}
        >
            <Box sx={{ flexGrow: 1, ml: 2}}>
                {/* Opis i Kategoria */}
                <Typography variant="body1" fontWeight="bold">
                    {item.description}{' '}
                    <Chip
                        label={item.category}
                        size="medium"
                        sx={{ ml: 1, height: 20, fontSize: '0.8rem', bgcolor: backgroundColor }}
                    />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {item.createdAt}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body1" fontWeight="bold" color="error.main" sx={{mr: 2}}>
                    {formattedAmount}
                </Typography>

            </Box>
        </ListItem>
    );
};

export default ExpenseListItem;