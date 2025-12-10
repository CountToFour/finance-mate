import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import { useNotification } from '../../components/NotificationContext';
import { depositToGoal } from '../../lib/api';
import type { Account, FinancialGoal } from '../../lib/types';

interface Props {
    open: boolean;
    onClose: () => void;
    goal: FinancialGoal | null;
    accounts: Account[];
    onSuccess: () => void;
}

const DepositGoalDialog: React.FC<Props> = ({ open, onClose, goal, accounts, onSuccess }) => {
    const { success, error } = useNotification();
    const [amount, setAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');

    const handleSave = async () => {
        if (!goal || !amount || !selectedAccount) return;

        try {
            await depositToGoal(goal.id, parseFloat(amount), selectedAccount);
            success('Wpłata zakończona sukcesem!');
            setAmount('');
            setSelectedAccount('');
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            error('Błąd podczas wpłacania środków');
        }
    };

    const handleClose = () => {
        setAmount('');
        setSelectedAccount('');
        onClose();
    };

    if (!goal) return null;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Wpłata na cel: {goal.name}</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={3}>
                    <Typography variant="body2">
                        Cel: <b>{goal.currentAmount} zł</b> / {goal.targetAmount} zł
                    </Typography>

                    <TextField
                        select
                        label="Wybierz konto źródłowe"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        fullWidth
                    >
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {acc.name} ({acc.balance} {acc.currency.symbol})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Kwota wpłaty"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: <Typography color="text.secondary">zł</Typography>
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="secondary">Anuluj</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={!amount || !selectedAccount}
                >
                    Wpłać
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DepositGoalDialog;