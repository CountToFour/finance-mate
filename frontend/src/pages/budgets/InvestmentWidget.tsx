import React, {useEffect, useState} from 'react';
import {Card, CardContent, Typography, Box, Chip, Stack, CircularProgress, Alert, LinearProgress} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type {InvestmentProfile, InvestmentRecommendation} from "../../types/recommendation.ts";
import {recommendationService} from "../../api/recommendation-client.ts";
import {useTranslation} from "react-i18next";

const SmartInvestmentWidget: React.FC = () => {
    const [data, setData] = useState<InvestmentRecommendation | null>(null);
    const [loading, setLoading] = useState(true);
    const {t} = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await recommendationService.getSmartInvestmentRecommendation()
                setData(response)
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const getProfileDisplay = (profile: InvestmentProfile) => {
        switch (profile) {
            case 'CRITICAL':
                return {
                    label: t('recommendation.invest.profile.critical'),
                    color: '#d32f2f',
                    icon: <ErrorOutlineIcon/>
                };
            case 'CONSERVATIVE':
                return {
                    label: t('recommendation.invest.profile.conservative'),
                    color: '#E6C200',
                    icon: <ShieldIcon/>
                };
            case 'BALANCED':
                return {
                    label: t('recommendation.invest.profile.balanced'),
                    color: '#2196F3',
                    icon: <ShowChartIcon/>
                };
            case 'AGGRESSIVE':
                return {
                    label: t('recommendation.invest.profile.aggressive'),
                    color: '#4CAF50',
                    icon: <BoltIcon/>
                };
            default:
                return {
                    label: t('recommendation.invest.profile.default'),
                    color: 'grey',
                    icon: null
                };
        }
    };

    if (loading) return <Box p={2} textAlign="center"><CircularProgress size={20}/></Box>;
    if (!data) return null;

    const profileDisplay = getProfileDisplay(data.profile);

    return (
        <Card variant="outlined"
              sx={{borderRadius: 2, height: '100%', borderColor: profileDisplay.color, borderWidth: 1}}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Box sx={{color: profileDisplay.color}}>{profileDisplay.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" sx={{color: profileDisplay.color}}>
                        {profileDisplay.label}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                    {data.message}
                </Typography>

                {data.savingsRate >= 0 && (
                    <Box sx={{mb: 3}}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                {t('recommendation.invest.analyze.label')}
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                                {(data.savingsRate * 100).toFixed(0)}{t('recommendation.invest.analyze.rate')}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(data.savingsRate * 100, 100)}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#ffcdd2',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: profileDisplay.color
                                }
                            }}
                        />
                    </Box>
                )}

                {data.recommendations.length === 0 ? (
                    <Alert severity="warning" sx={{mt: 1}}>
                        {t('recommendation.invest.empty')}
                    </Alert>
                ) : (
                    <Stack spacing={1}>
                        {data.recommendations.map((rec) => (
                            <Box key={rec.symbol}
                                 sx={{
                                     display: 'flex',
                                     justifyContent: 'space-between',
                                     alignItems: 'center',
                                     p: 1.5,
                                     borderRadius: 2,
                                     bgcolor: 'background.paper',
                                     boxShadow: 1,
                                     borderLeft: `4px solid ${rec.action === 'BUY' ? '#4CAF50' : (rec.action === 'SELL' ? '#F44336' : '#9E9E9E')}`
                                 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{rec.friendlyName}</Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="caption" fontWeight="medium" color="text.primary">
                                            {rec.latestClose.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('recommendation.invest.rsi')} {rec.rsiValue.toFixed(1)}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Chip
                                    label={rec.action === 'BUY' ? t('recommendation.invest.buy') : (rec.action === 'SELL' ? t('recommendation.invest.sell') : t('recommendation.invest.hold'))}
                                    size="small"
                                    icon={rec.action === 'BUY' ? <TrendingUpIcon/> : (rec.action === 'SELL' ?
                                        <TrendingDownIcon/> : undefined)}
                                    sx={{
                                        fontWeight: 'bold',
                                        bgcolor: rec.action === 'BUY' ? 'rgba(76, 175, 80, 0.1)' : (rec.action === 'SELL' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(158, 158, 158, 0.1)'),
                                        color: rec.action === 'BUY' ? 'success.main' : (rec.action === 'SELL' ? 'error.main' : 'text.secondary')
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default SmartInvestmentWidget;