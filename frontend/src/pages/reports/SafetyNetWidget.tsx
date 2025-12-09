import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Skeleton, Alert } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { getSmartRecommendations } from '../../lib/api';
import type { SmartRecommendation } from '../../lib/types';

const SafetyNetWidget: React.FC = () => {
    const [data, setData] = useState<SmartRecommendation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSmartRecommendations()
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />;
    if (!data) return null;

    const getConfig = (status: string) => {
        switch (status) {
            case 'DANGER': return { color: '#d32f2f', label: 'Krytyczny', msg: 'Masz środki na mniej niż 1 miesiąc życia.' };
            case 'WARNING': return { color: '#ff9800', label: 'Niski', msg: 'Zalecana poduszka to min. 3 miesiące.' };
            case 'SAFE': return { color: '#4caf50', label: 'Stabilny', msg: 'Masz bezpieczny zapas na 3-6 miesięcy.' };
            case 'EXCELLENT': return { color: '#2196f3', label: 'Doskonały', msg: 'Twój bufor bezpieczeństwa jest imponujący (>6 mies.)' };
            default: return { color: 'grey', label: 'Nieznany', msg: '' };
        }
    };

    const config = getConfig(data.safetyNetStatus);
    const progressValue = Math.min((data.monthsOfSafety / 6) * 100, 100);

    return (
        <Card sx={{ height: '100%', mt: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <HealthAndSafetyIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">Poduszka Finansowa</Typography>
                    </Box>
                    <Chip
                        label={config.label}
                        size="small"
                        sx={{ bgcolor: `${config.color}20`, color: config.color, fontWeight: 'bold' }}
                    />
                </Box>

                <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                    {data.monthsOfSafety.toFixed(1)} <Typography component="span" variant="h6" color="text.secondary">mies.</Typography>
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Szacowany czas przetrwania bez dochodów
                </Typography>

                <Box sx={{ mt: 3, mb: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': { bgcolor: config.color }
                        }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">0 mies.</Typography>
                        <Typography variant="caption" color="text.secondary">Cel: 6 mies.</Typography>
                    </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 2, py: 0, '& .MuiAlert-message': { fontSize: '0.85rem' } }}>
                    {config.msg}
                </Alert>
            </CardContent>
        </Card>
    );
};

export default SafetyNetWidget;