import {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Grid,
} from "@mui/material";
import {Add} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";
import {getExpenses} from "../../lib/api.ts";
import {useAuthStore} from "../../store/auth.ts";
import type {Expense} from "../../lib/types.ts";
import {DataGrid, type GridColDef} from '@mui/x-data-grid';

const COLORS = ["#5C86D3", "#A175BF", "#CDB557", "#7AB6D1"];

function ExpensesPage() {
    const user = useAuthStore(s => s.user);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const paginationModel = {page: 0, pageSize: 5};

    useEffect(() => {
        getExpenses(user?.id).then((res) => setExpenses(res.data));
        console.log(expenses)
    }, [user?.id]);

    const totalSpending = expenses.reduce((acc, e) => acc + e.price, 0);
    const avgDaily = totalSpending / 30;
    const avgMonthly = totalSpending; // można dostosować do okresu

    const columns: GridColDef[] = [
        {
            field: 'category',
            headerName: 'Kategoria',
            flex: 1.5,
        },
        {
            field: 'price',
            headerName: 'Cena',
            flex: 1,
        },
        {
            field: 'expenseDate',
            headerName: 'Data wydatku',
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Akcje',
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    width: '100%',
                    height: '100%',
                }}>
                    <IconButton color="secondary">
                        <PreviewIcon/>
                    </IconButton>
                    <IconButton color="error">
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            ),
        },

    ]

    return (
        <Box p={2} display="flex" gap={3}>
            {/* Główna sekcja */}
            <Box flex={1.5}>
                <Card sx={{mb: 3}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Wydatki według kategorii
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenses}
                                    dataKey="price"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {expenses.map((_, i) => (
                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography variant="subtitle1" align="center" mt={2}>
                            Całkowite wydatki: {totalSpending.toFixed(2)} zł
                        </Typography>
                    </CardContent>
                </Card>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Średnie miesięczne</Typography>
                                <Typography variant="h6">{avgMonthly.toFixed(2)} zł</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Średnie dzienne</Typography>
                                <Typography variant="h6">{avgDaily.toFixed(2)} zł</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Panel boczny */}
            <Box flex={1}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Twoje wydatki</Typography>
                            <IconButton color="secondary">
                                <Add/>
                            </IconButton>
                        </Box>
                        <Divider sx={{my: 1}}/>
                        <DataGrid
                            rows={expenses}
                            columns={columns}
                            initialState={{pagination: {paginationModel}}}
                            pageSizeOptions={[5, 10]}
                            disableColumnMenu={true}
                            disableColumnResize={true}
                            sx={{border: 0, width: '100%'}}
                        />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default ExpensesPage;