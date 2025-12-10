import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {getGoalAccelerator} from '../../lib/api';
import type { GoalRecommendation } from '../../lib/types';

const GoalAcceleratorWidget: React.FC = () => {
    const [rec, setRec] = useState<GoalRecommendation | null>(null);

    useEffect(() => {
        getGoalAccelerator()
            .then(res => setRec(res.data))
            .catch(console.error);
    }, []);

    if (!rec) return null;

    return (
        <Card variant="outlined" sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mt: 3
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <RocketLaunchIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                            Przyspiesz cel: <strong>{rec.goalName}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Analiza "Szybka Ścieżka"
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {rec.message}
                </Typography>

                <Box mt={2} p={1.5} bgcolor="rgba(0,0,0,0.2)" borderRadius={2}>
                    <Typography variant="body2">
                        Potencjalna oszczędność: <span style={{color: '#4ade80', fontWeight: 'bold'}}>+{rec.monthlySavingsPotential} zł</span> / mies.
                    </Typography>
                    {rec.monthsFaster > 0 && (
                        <Typography variant="body2">
                            Czas realizacji: <span style={{color: '#facc15', fontWeight: 'bold'}}>-{rec.monthsFaster} mies.</span>
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default GoalAcceleratorWidget;