import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControlLabel, Switch, Box, MenuItem
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { createGoal } from '../../lib/api';
import type {FinancialGoal, CreateGoalDto, Account} from '../../lib/types';
import { useNotification } from '../../components/NotificationContext';

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (goal: FinancialGoal) => void;
    accounts: Account[];
    currency: string;
}

const AddGoalDialog: React.FC<Props> = ({ open, onClose, onSaved, accounts, currency }) => {
    const { success, error } = useNotification();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [initialAmount, setInitialAmount] = useState('');
    const [deadline, setDeadline] = useState<Dayjs | null>(dayjs().add(1, 'month'));
    const [locked, setLocked] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [monthlyContribution, setMonthlyContribution] = useState('');

    const handleSubmit = async () => {
        if (!name || !targetAmount || !deadline) {
            error('Wypełnij wymagane pola');
            return;
        }

        const dto: CreateGoalDto = {
            name,
            targetAmount: parseFloat(targetAmount),
            initialAmount: parseFloat(initialAmount) || 0,
            monthlyContribution: parseFloat(monthlyContribution) || 0,
            lockedFunds: locked,
            deadline: deadline.format('YYYY-MM-DD'),
            accountId: selectedAccount?.id
        };

        try {
            const res = await createGoal(dto);
            success('Cel finansowy utworzony!');
            onSaved(res.data);
            handleClose();
        } catch (e) {
            console.error(e);
            error('Nie udało się utworzyć celu');
        }
    };

    const handleClose = () => {
        setName('');
        setTargetAmount('');
        setInitialAmount('');
        setMonthlyContribution('');
        setDeadline(dayjs().add(1, 'month'));
        setLocked(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Nowy Cel Finansowy</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Nazwa celu"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="np. Wakacje, Nowy samochód"
                />

                <Box display="flex" gap={2} mt={1}>
                    <TextField
                        label="Kwota docelowa"
                        type="number"
                        fullWidth
                        value={targetAmount}
                        onChange={e => setTargetAmount(e.target.value)}
                        sx={{flex: 1}}
                    />
                    <TextField
                        label="Wpłata początkowa"
                        type="number"
                        fullWidth
                        value={initialAmount}
                        onChange={e => setInitialAmount(e.target.value)}
                        helperText="Opcjonalnie"
                        sx={{flex: 1}}
                    />
                    <TextField
                        label="Wpłata miesięczna"
                        type="number"
                        fullWidth
                        value={monthlyContribution}
                        onChange={e => setMonthlyContribution(e.target.value)}
                        helperText="Do wyliczeń (stałe zlecenie)"
                        sx={{flex: 1}}
                    />
                    <TextField
                        fullWidth
                        label={"Waluta"}
                        value={currency ?? ""}
                        disabled
                        sx={{ flex: 0.5 }}
                    />
                </Box>
                {initialAmount && (
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        //TODO WIELOJEZYCZNOSC
                        label={'Konto'}
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

                <Box mt={2} mb={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Data realizacji"
                            value={deadline}
                            onChange={setDeadline}
                            slotProps={{ textField: { fullWidth: true } }}
                            disablePast
                        />
                    </LocalizationProvider>
                </Box>

                <FormControlLabel
                    control={<Switch checked={locked} onChange={e => setLocked(e.target.checked)} />}
                    label="Zablokuj środki (brak możliwości wypłaty przed końcem)"
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="secondary">Anuluj</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">Utwórz cel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddGoalDialog;