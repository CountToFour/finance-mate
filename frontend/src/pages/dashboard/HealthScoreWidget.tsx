import React from 'react';
import {Card, CardContent, Typography, Box, CircularProgress, Chip, useTheme} from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

interface Props {
    recommendationText: string;
}

const HealthScoreWidget: React.FC<Props> = ({recommendationText}) => {
    const theme = useTheme();

    const scoreMatch = recommendationText.match(/AI Score: (\d+)\/100 \((.*?)\)/);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const status = scoreMatch ? scoreMatch[2] : 'N/A';

    const cleanAdvice = recommendationText.replace(/AI Score: \d+\/100 \(.*?\)\.\s*/, '');

    const getColor = (s: number) => {
        if (s >= 80) return theme.palette.success.main;
        if (s >= 50) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const color = getColor(score);

    return (
        <Card variant="outlined" sx={{borderRadius: 2, height: '100%', position: 'relative', overflow: 'visible'}}>
            <CardContent sx={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

                <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <AutoGraphIcon color="secondary"/> Zdrowie Finansowe
                    </Typography>
                    <Chip
                        label="AI Powered"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{fontSize: '0.65rem', height: 20}}
                    />
                </Box>

                <Box sx={{position: 'relative', display: 'inline-flex', mb: 2}}>
                    <CircularProgress
                        variant="determinate"
                        value={100}
                        size={140}
                        thickness={4}
                        sx={{color: theme.palette.grey[200]}}
                    />
                    <CircularProgress
                        variant="determinate"
                        value={score}
                        size={140}
                        thickness={4}
                        sx={{
                            color: color,
                            position: 'absolute',
                            left: 0,
                            strokeLinecap: 'round',
                        }}
                    />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography variant="h3" component="div" fontWeight="bold" color="text.primary">
                            {score}
                        </Typography>
                        <Typography variant="caption" color="text.secondary"
                                    sx={{textTransform: 'uppercase', fontWeight: 'bold', color: color}}>
                            {status}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    bgcolor={`${color}15`}
                    p={2}
                    borderRadius={2}
                    width="100%"
                    textAlign="center"
                >
                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {cleanAdvice || "Brak wystarczających danych do wygenerowania porady."}
                    </Typography>
                </Box>

            </CardContent>
        </Card>
    );
};

export default HealthScoreWidget;