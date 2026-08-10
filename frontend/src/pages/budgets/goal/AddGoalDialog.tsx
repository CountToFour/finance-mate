import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, MenuItem, Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNotification } from '../../../components/NotificationContext.tsx';
import type {FinancialGoal, FinancialGoalDto, PeriodContribution} from "../../../types/budget.ts";
import type {Account} from "../../../types/account.ts";
import {budgetService} from "../../../api/budget-client.ts";
import {useTranslation} from "react-i18next";
import {getContributionPeriodTypes} from "../../../types/budget.ts";

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (goal: FinancialGoal) => void;
    accounts: Account[];
    currency: string;
}

const AddGoalDialog: React.FC<Props> = ({ open, onClose, onSaved, accounts, currency }) => {
    const { success, error } = useNotification();
    const {t} = useTranslation()
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [initialAmount, setInitialAmount] = useState('');
    const [deadline, setDeadline] = useState<Dayjs | null>(dayjs().add(1, 'month'));
    const [locked, setLocked] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [contribution, setContribution] = useState('');
    const [periodContribution, setPeriodContribution] = useState<PeriodContribution>("MONTHLY")

    const periodTypes = getContributionPeriodTypes(t)

    const handleSubmit = async () => {
        if (!name || !targetAmount || !deadline) {
            error(t('goal.dialog.add.error'));
            return;
        }

        const dto: FinancialGoalDto = {
            name: name,
            targetAmount: parseFloat(targetAmount),
            initialAmount: parseFloat(initialAmount) || 0,
            contribution: parseFloat(contribution) || 0,
            lockedFunds: locked,
            deadline: deadline.format('YYYY-MM-DD'),
            accountId: selectedAccount?.id,
            periodContribution: periodContribution,
        };

        try {
            const res = await budgetService.createGoal(dto);
            success(t('goal.page.add.success'));
            onSaved(res);
            handleClose();
        } catch (e) {
            console.error(e);
            error(t('goal.page.add.error'));
        }
    };

    const handleClose = () => {
        setName('');
        setTargetAmount('');
        setInitialAmount('');
        setContribution('');
        setDeadline(dayjs().add(1, 'month'));
        setLocked(false);
        setPeriodContribution("MONTHLY")
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {t('goal.dialog.add.label')}
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" gap={2}>
                    <TextField
                        label={t('goal.dialog.add.name.label')}
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('goal.dialog.add.name.helper')}
                        sx={{flex: 1}}
                    />
                    <TextField
                        label={t('goal.dialog.add.targetAmount.label')}
                        type="number"
                        margin="normal"
                        fullWidth
                        value={targetAmount}
                        onChange={e => setTargetAmount(e.target.value)}
                        sx={{flex: 0.5}}
                    />
                </Box>
                <Box mt={2} mb={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={t('goal.dialog.add.date.label')}
                            value={deadline}
                            onChange={setDeadline}
                            slotProps={{ textField: { fullWidth: true } }}
                            disablePast
                        />
                    </LocalizationProvider>
                </Box>
                <Typography>
                    {t('goal.dialog.add.optional')}
                </Typography>
                <Box display="flex" gap={2} mt={1}>
                    <TextField
                        label={t('goal.dialog.add.initialAmount.label')}
                        type="number"
                        fullWidth
                        value={initialAmount}
                        onChange={e => setInitialAmount(e.target.value)}
                        sx={{flex: 1}}
                    />
                    <TextField
                        label={t('goal.dialog.add.contribution.label')}
                        type="number"
                        fullWidth
                        value={contribution}
                        onChange={e => setContribution(e.target.value)}
                        sx={{flex: 1}}
                    />
                    <TextField
                        fullWidth
                        label={t('goal.dialog.add.currency.label')}
                        value={currency ?? ""}
                        disabled
                        sx={{ flex: 0.5 }}
                    />
                </Box>
                {contribution && (
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label={t('goal.dialog.add.periodContribution.label')}
                        value={periodContribution}
                        onChange={(e) => setPeriodContribution(e.target.value as PeriodContribution)}
                        defaultValue={"MONTHLY"}
                    >
                        {Object.entries(periodTypes).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                {(initialAmount || contribution) && (
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label={t('goal.dialog.add.account.label')}
                        value={selectedAccount ? selectedAccount.id : ""}
                        onChange={(e) => {
                            const id = e.target.value as string;
                            const acct = accounts.find(a => a.id === id) ?? null;
                            setSelectedAccount(acct);
                        }
                        }
                    >
                        {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                                {account.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                {/*<FormControlLabel*/}
                {/*    control={<Switch checked={locked} onChange={e => setLocked(e.target.checked)} />}*/}
                {/*    label="Zablokuj środki (brak możliwości wypłaty przed końcem)"*/}
                {/*/>*/}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="secondary">
                    {t('goal.dialog.add.cancel')}
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {t('goal.dialog.add.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddGoalDialog;