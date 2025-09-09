import {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Button,
} from "@mui/material";
import {Add} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";
import {deleteExpense, getExpenses} from "../../lib/api.ts";
import {useAuthStore} from "../../store/auth.ts";
import type {Expense} from "../../lib/types.ts";
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddExpenseDialog from "./AddExpenseDialog.tsx";

const COLORS = ["#5C86D3", "#A175BF", "#CDB557", "#7AB6D1"];

function ExpensesPage() {
    const user = useAuthStore(s => s.user);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const paginationModel = {page: 0, pageSize: 5};
    const totalSpending = expenses.reduce((acc, e) => acc + e.price, 0);

    useEffect(() => {
        getExpenses(user?.id).then((res) => setExpenses(res.data));
    }, [user?.id, openDialog]);

    const handleDeletion = (id: string) => {
        console.log(id)
        deleteExpense(id)
            .then(() => {
                success("Wydatek został usunięty")
                getExpenses(user?.id).then((res) => setExpenses(res.data));
            })
            .catch(() => {
                error("Nie udało się usunąć wydatku")
            });
    };

    const columns: GridColDef[] = [
        {
            field: 'expenseDate',
            headerName: 'Data wydatku',
            flex: 1,
        },
        {
            field: 'description',
            headerName: "Opis",
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'category',
            headerName: 'Kategoria',
            flex: 1.5,
        },
        {
            field: 'price',
            headerName: 'Kwota',
            flex: 1,
            valueFormatter: value => `-${value} zł`,
            cellClassName: 'priceNegative',
        },
        {
            field: 'actions',
            headerName: 'Akcje',
            flex: 0.8,
            sortable: false,
            filterable: false,
            headerAlign: 'right',
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'right',
                    width: '100%',
                    height: '100%',
                }}>
                    <IconButton
                    >
                        <EditOutlinedIcon/>
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDeletion(params.row.id)}
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            ),
        },
    ]

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={"bold"} color={"secondary"}>Twoje wydatki</Typography>
                    <Typography variant="body2" sx={{mt:1}}>Zarządzaj swoimi wydatkami i śledź kategorie</Typography>
                </Box>
                <Button
                    variant={'contained'}
                    color={"secondary"}
                    onClick={() => setOpenDialog(true)}
                >
                    <Add sx={{mr: 1}}/>
                    Dodaj wydatek
                </Button>
            </Box>
            <Box p={2} display="flex" gap={3}>
                <Box flex={1}>
                    <Card>
                        <CardContent>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={"bold"}>Ostatnie wydatki</Typography>
                                <Typography variant="body2" color={"text.secondary"}>Przegląd najnowszych transakcji</Typography>
                            </Box>
                            <Divider sx={{my: 1}}/>
                            <DataGrid
                                rows={expenses}
                                columns={columns}
                                initialState={{pagination: {paginationModel}}}
                                pageSizeOptions={[5, 10]}
                                disableColumnMenu={true}
                                disableColumnResize={true}
                                disableRowSelectionOnClick={true}
                                sx={{
                                    border: 0, width: '100%', backgroundColor: 'transparent',
                                    '& .MuiDataGrid-cell.priceNegative': {
                                        color: 'error.main',
                                        fontWeight: 500,
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Box>

                <Box flex={1}>
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
                </Box>
                <AddExpenseDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                />
            </Box>
        </>
    );
}

export default ExpensesPage;