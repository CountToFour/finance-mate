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
import { useNotification } from '../../../components/NotificationContext.tsx';
import type {FinancialGoal} from "../../../types/budget.ts";
import type {Account} from "../../../types/account.ts";
import {budgetService} from "../../../api/budget-client.ts";
import {useTranslation} from "react-i18next";

interface Props {
    open: boolean;
    onClose: () => void;
    goal: FinancialGoal | null;
    accounts: Account[];
    onSuccess: (goal: FinancialGoal) => void;
}

const DepositGoalDialog: React.FC<Props> = ({ open, onClose, goal, accounts, onSuccess }) => {
    const { success, error } = useNotification();
    const [amount, setAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const {t} = useTranslation();

    const handleSave = async () => {
        if (!goal || !amount || !selectedAccount) return;

        try {
            const goalResponse = await budgetService.deposit(goal.id, parseFloat(amount), selectedAccount);
            success(t('goal.page.deposit.success'));
            setAmount('');
            setSelectedAccount('');
            onSuccess(goalResponse);
            onClose();
        } catch (e) {
            console.error(e);
            error(t('goal.page.deposit.error'));
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
            <DialogTitle>
                {t('goal.dialog.deposit.label')} {goal.name}
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={3}>
                    <Typography variant="body2">
                        {t('goal.dialog.deposit.targetAmount')} <b>{goal.currentAmount} zł</b> / {goal.targetAmount} zł
                    </Typography>

                    <TextField
                        select
                        label={t('goal.dialog.deposit.account.source')}
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        fullWidth
                    >
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {/*{acc.name} ({acc.balance} {acc.currency.symbol})*/}
                                {acc.name} ({acc.balance} {"zł"})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label={t('goal.dialog.deposit.amount.label')}
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
                <Button onClick={handleClose} color="secondary">
                    {t('goal.dialog.deposit.cancel')}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={!amount || !selectedAccount}
                >
                    {t('goal.dialog.deposit.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default DepositGoalDialog;