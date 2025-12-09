import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Chip, Stack, LinearProgress } from '@mui/material';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getSmartRecommendations } from '../../lib/api';
import type { SmartRecommendation } from '../../lib/types';

const CashFlowWidget: React.FC = () => {
    const [data, setData] = useState<SmartRecommendation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSmartRecommendations()
            .then(res => {
                setData(res.data)
                console.log(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box p={2} display="flex" justifyContent="center"><CircularProgress size={20} /></Box>;
    if (!data) return null;

    if (data.forecastStatus === 'INSUFFICIENT_DATA') {
        return (
            <Box />
        );
    }

    const getConfig = (status: string) => {
        switch (status) {
            case 'CRITICAL':
                return {
                    color: '#d32f2f',
                    bg: '#ffebee',
                    icon: <WarningIcon fontSize="small" />,
                    label: 'Zagrożenie płynności',
                    desc: 'Przy obecnym tempie wydatków zabraknie Ci środków przed końcem miesiąca.'
                };
            case 'WARNING':
                return {
                    color: '#ff9800',
                    bg: '#fff3e0',
                    icon: <TrendingFlatIcon fontSize="small" />,
                    label: 'Na styk',
                    desc: 'Uważaj. Twój zapas gotówki na koniec miesiąca będzie minimalny.'
                };
            default:
                return {
                    color: '#2e7d32',
                    bg: '#e8f5e9',
                    icon: <CheckCircleIcon fontSize="small" />,
                    label: 'Stabilnie',
                    desc: 'Twoje tempo wydatków jest bezpieczne. Zakończysz miesiąc na plusie.'
                };
        }
    };

    const config = getConfig(data.forecastStatus);
    const isCritical = data.forecastStatus === 'CRITICAL';

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', borderColor: config.color, mt: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Prognoza Płynności
                    </Typography>
                    <Chip
                        label={config.label}
                        icon={config.icon}
                        size="small"
                        sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            fontWeight: 'bold',
                            border: `1px solid ${config.color}`
                        }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={3} sx={{ minHeight: '40px' }}>
                    {config.desc}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={1}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Prognozowane saldo (koniec m-ca)
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color={isCritical ? 'error.main' : 'success.main'}>
                            {data.projectedBalanceEndOfMonth.toLocaleString('pl-PL', { minimumFractionDigits: 0 })} zł
                        </Typography>
                    </Box>

                    <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary" display="block">
                            Bezpieczny limit dzienny
                        </Typography>
                        <Typography variant="h6" fontWeight="medium" color="primary">
                            {data.dailySafeSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                        </Typography>
                    </Box>
                </Stack>

                {!isCritical && (
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">Margines bezpieczeństwa</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={data.safetyMarginPercent}
                            sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: config.color } }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default CashFlowWidget;