import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import { getCurrencies, changeUserCurrency, getExchangeRate } from '../../lib/api';
import type { Currency } from '../../lib/types';
import { useNotification } from '../../components/NotificationContext';

const GeneralSettings: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [mainCurrency, setMainCurrency] = useState<string>('PLN');
    const [rates, setRates] = useState<{ code: string; rate: number }[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const { success, error } = useNotification();

    useEffect(() => {
        getCurrencies()
            .then((res) => {
                setCurrencies(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (!mainCurrency || currencies.length === 0) return;

        const fetchRates = async () => {
            setLoadingRates(true);
            const newRates: { code: string; rate: number }[] = [];
            const targets = currencies.filter(c => c.code !== mainCurrency);

            try {
                const promises = targets.map(target =>
                    getExchangeRate(mainCurrency, target.code)
                        .then(res => ({
                            code: target.code,
                            rate: res.data.conversion_rate
                        }))
                        .catch(e => {
                            console.error(`Błąd pobierania kursu dla ${target.code}`, e);
                            return null;
                        })
                );

                const results = await Promise.all(promises);
                results.forEach(r => {
                    if (r) newRates.push(r);
                });

                setRates(newRates);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingRates(false);
            }
        };

        fetchRates();
    }, [mainCurrency, currencies]);

    const handleSave = async () => {
        try {
            await changeUserCurrency(mainCurrency);
            success(`Główna waluta zmieniona na ${mainCurrency}`);
            //TODO ODŚWIEŻYĆ DANE UŻYTKOWNIKA W STORE
        } catch (e) {
            console.error(e);
            error('Nie udało się zapisać ustawień');
        }
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Ustawienia walutowe
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Wybierz walutę, w której chcesz widzieć łączne saldo swojego majątku.
                </Typography>
                
                <Box display="flex" gap={2} alignItems="center" mb={4}>
                    <TextField
                        select
                        label="Główna waluta"
                        value={mainCurrency}
                        onChange={(e) => setMainCurrency(e.target.value)}
                        sx={{ width: 200 }}
                        size="small"
                    >
                        {currencies.map((c) => (
                            <MenuItem key={c.code} value={c.code}>
                                {c.code} ({c.symbol})
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button variant="contained" color="secondary" onClick={handleSave}>
                        Zapisz
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Aktualne kursy wymiany
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Wartość 1 {mainCurrency} w innych walutach:
                </Typography>

                {/* Tabela kursów */}
                {loadingRates ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell>Waluta</TableCell>
                                    <TableCell align="right">Kurs</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            Brak danych lub brak innych walut.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {rates.map((row) => (
                                    <TableRow key={row.code}>
                                        <TableCell component="th" scope="row">
                                            {row.code}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.rate.toFixed(4)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                
                <Box mt={2}>
                    <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                        Kursy są pobierane z zewnętrznego API i aktualizowane okresowo.
                    </Alert>
                </Box>
            </CardContent>
        </Card>
    );
};

export default GeneralSettings;