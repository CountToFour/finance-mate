import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControlLabel, Switch, Box
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { createGoal } from '../../lib/api';
import type { FinancialGoal, CreateGoalDto } from '../../lib/types';
import { useNotification } from '../../components/NotificationContext';

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (goal: FinancialGoal) => void;
}

const AddGoalDialog: React.FC<Props> = ({ open, onClose, onSaved }) => {
    const { success, error } = useNotification();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [initialAmount, setInitialAmount] = useState('');
    const [deadline, setDeadline] = useState<Dayjs | null>(dayjs().add(1, 'year'));
    const [locked, setLocked] = useState(false);

    const handleSubmit = async () => {
        if (!name || !targetAmount || !deadline) {
            error('Wypełnij wymagane pola');
            return;
        }

        const dto: CreateGoalDto = {
            name,
            targetAmount: parseFloat(targetAmount),
            initialAmount: parseFloat(initialAmount) || 0,
            lockedFunds: locked,
            deadline: deadline.format('YYYY-MM-DD')
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
        setDeadline(dayjs().add(1, 'year'));
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
                    />
                    <TextField
                        label="Wpłata początkowa"
                        type="number"
                        fullWidth
                        value={initialAmount}
                        onChange={e => setInitialAmount(e.target.value)}
                        helperText="Opcjonalnie"
                    />
                </Box>

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
                <Button onClick={handleSubmit} variant="contained" color="secondary">Utwórz cel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddGoalDialog;