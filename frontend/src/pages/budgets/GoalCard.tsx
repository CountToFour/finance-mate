import React from 'react';
import {Card, CardContent, Typography, Box, LinearProgress, Chip, Button, Stack} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import LockIcon from '@mui/icons-material/Lock';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type { FinancialGoal } from '../../lib/types';
import dayjs from 'dayjs';

interface Props {
    goal: FinancialGoal;
    onDeposit: (goal: FinancialGoal) => void;
}

const GoalCard: React.FC<Props> = ({ goal, onDeposit }) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const daysLeft = dayjs(goal.deadline).diff(dayjs(), 'day');

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, position: 'relative', overflow: 'visible' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                            {goal.name}
                            {goal.lockedFunds && <LockIcon fontSize="small" color="disabled" titleAccess="Środki zablokowane" />}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Termin: {goal.deadline} ({daysLeft > 0 ? `${daysLeft} dni` : 'Dziś'})
                        </Typography>
                    </Box>
                    <Chip
                        icon={<FlagIcon style={{fontSize: 16}}/>}
                        label={goal.completed ? "Osiągnięty" : "W trakcie"}
                        color={goal.completed ? "success" : "default"}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight="bold">
                            {goal.currentAmount.toLocaleString()} zł
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            z {goal.targetAmount.toLocaleString()} zł
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f5f5f5',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: goal.completed ? '#4caf50' : '#70B2B1'
                            }
                        }}
                    />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                            {progress.toFixed(1)}%
                        </Typography>

                        {!goal.completed && (
                            <Button
                                size="small"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => onDeposit(goal)}
                                sx={{ textTransform: 'none' }}
                            >
                                Wpłać
                            </Button>
                        )}
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default GoalCard;