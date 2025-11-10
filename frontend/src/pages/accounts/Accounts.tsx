import React, {useEffect, useState, useCallback} from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    Divider,
    Paper,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import {Add} from '@mui/icons-material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {getAccounts, getCurrencies} from "../../lib/api.ts";
import type {Account, Currency, CreateAccountDto} from "../../lib/types.ts";
import {useNotification} from "../../components/NotificationContext.tsx";
import {useNavigate} from "react-router-dom";
import AddExpenseDialog from "../expenses/AddExpenseDialog.tsx";
import AddAccountDialog from "./AddAccountDialog.tsx";

export default function Accounts() {
    const [openDialog, setOpenDialog] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CreateAccountDto & {balanceStr?: string}>({
        name: '',
        description: '',
        currencyId: '',
        balance: 0,
        color: '#2b8aef',
        includeInStats: true,
        balanceStr: '0.00'
    });

    const {success, error} = useNotification();
    const navigate = useNavigate();

    // const loadAll = useCallback(async () => {
    //     setIsLoading(true);
    //     try {
    //         const [accRes, curRes] = await Promise.all([getAccounts(), getCurrencies()]);
    //         setAccounts(accRes.data);
    //         setCurrencies(curRes.data);
    //         if (accRes.data.length === 0) {
    //             setShowCreate(true);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         error('Nie udało się pobrać kont');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [error]);
    //
    // useEffect(() => {
    //     void loadAll();
    // }, [loadAll]);

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={'bold'} color={'secondary'}>Konta</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>Zarządzaj swoimi kontami</Typography>
                </Box>
                <Button variant={'contained'} color={'secondary'} onClick={() => {setOpenDialog(true)}}>
                    <Add sx={{mr: 1}}/>
                    Nowe konto
                </Button>
            </Box>

            {/*<Box ml={2} mr={2}>*/}
            {/*    <Card>*/}
            {/*        <CardContent>*/}
            {/*            <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>*/}
            {/*                <Box>*/}
            {/*                    <Typography variant="subtitle1" fontWeight={'bold'}>Twoje konta</Typography>*/}
            {/*                    <Typography variant="body2" color={'text.secondary'}>Lista aktywnych kont</Typography>*/}
            {/*                </Box>*/}
            {/*            </Box>*/}
            {/*            <Divider sx={{my: 1}}/>*/}
            {/*            <DataGrid*/}
            {/*                 rows={accounts}*/}
            {/*                 columns={columns}*/}
            {/*                 getRowId={(row) => row.id}*/}
            {/*                 pageSizeOptions={[5, 10]}*/}
            {/*                 disableColumnMenu*/}
            {/*                 disableRowSelectionOnClick*/}
            {/*                 loading={isLoading}*/}
            {/*                 sx={{border: 0, width: '100%', backgroundColor: 'transparent'}}*/}
            {/*             />*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}
            {/*</Box>*/}

            {/*{showCreate && (*/}
            {/*    <Box ml={2} mr={2} mt={2}>*/}
            {/*        <Paper sx={{p:2}}>*/}
            {/*            <form onSubmit={handleCreate}>*/}
            {/*                <Box sx={{display: 'grid', gap: 16, gridTemplateColumns: {xs: '1fr', md: 'repeat(2, 1fr)'}}}>*/}
            {/*                    <Box>*/}
            {/*                        <TextField label="Nazwa" fullWidth required value={form.name}*/}
            {/*                                   onChange={(e) => handleChange('name', e.target.value)} />*/}
            {/*                    </Box>*/}
            {/*                    <Box>*/}
            {/*                        <TextField label="Waluta" select fullWidth required value={form.currencyId}*/}
            {/*                                   onChange={(e) => handleChange('currencyId', e.target.value)}>*/}
            {/*                            <MenuItem value="">— wybierz —</MenuItem>*/}
            {/*                            {currencies.map(c => (*/}
            {/*                                <MenuItem key={c.id} value={c.id}>{c.code} {c.name ? `- ${c.name}` : ''}</MenuItem>*/}
            {/*                            ))}*/}
            {/*                        </TextField>*/}
            {/*                    </Box>*/}
            {/*                    <Box>*/}
            {/*                        <TextField label="Saldo" fullWidth value={form.balanceStr}*/}
            {/*                                   onChange={(e) => handleChange('balanceStr', e.target.value)} />*/}
            {/*                    </Box>*/}
            {/*                    <Box>*/}
            {/*                        <TextField label="Kolor" type="color" fullWidth value={form.color}*/}
            {/*                                   onChange={(e) => handleChange('color', e.target.value)} />*/}
            {/*                    </Box>*/}
            {/*                    <Box sx={{gridColumn: '1 / -1'}}>*/}
            {/*                        <TextField label="Opis" fullWidth value={form.description}*/}
            {/*                                   onChange={(e) => handleChange('description', e.target.value)} />*/}
            {/*                    </Box>*/}
            {/*                    <Box sx={{gridColumn: '1 / -1'}}>*/}
            {/*                        <FormControlLabel control={<Checkbox checked={form.includeInStats} onChange={(e)=>handleChange('includeInStats', e.target.checked)} />} label="Uwzględniaj w statystykach" />*/}
            {/*                    </Box>*/}
            {/*                    <Box sx={{gridColumn: '1 / -1', display: 'flex', gap: 2}}>*/}
            {/*                        <Button variant='contained' color='secondary' type='submit' disabled={saving || isLoading}>{saving ? 'Tworzenie...' : 'Utwórz konto'}</Button>*/}
            {/*                        <Button variant='outlined' onClick={() => setShowCreate(false)}>Anuluj</Button>*/}
            {/*                    </Box>*/}
            {/*                </Box>*/}
            {/*            </form>*/}
            {/*        </Paper>*/}
            {/*    </Box>*/}
            {/*)}*/}
            <AddAccountDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                initialAccount={null}
            />
        </>
    )
}
