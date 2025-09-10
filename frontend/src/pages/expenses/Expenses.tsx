import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Button, MenuItem, TextField,
} from "@mui/material";
import {Add} from "@mui/icons-material";
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";
import {deleteExpense, getExpenses} from "../../lib/api.ts";
import {useAuthStore} from "../../store/auth.ts";
import type {Expense} from "../../lib/types.ts";
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddExpenseDialog from "./AddExpenseDialog.tsx";
import dayjs, {type Dayjs} from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

const COLORS = ["#5C86D3", "#A175BF", "#CDB557", "#7AB6D1"];
const categories = ["Wszystkie", "Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"];
const currentYear = dayjs();

function ExpensesPage() {
    const user = useAuthStore(s => s.user);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [category, setCategory] = useState<string>("Wszystkie");
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    
    const paginationModel = {page: 0, pageSize: 5};
    const totalSpending = expenses.reduce((acc, e) => acc + e.price, 0);

    useEffect(() => {
        if (category === "Wszystkie") {
            getExpenses(user?.id, null, dateFrom, dateTo).then((res) => setExpenses(res.data));
        } else {
            getExpenses(user?.id, category, dateFrom, dateTo).then((res) => setExpenses(res.data));
        }
    }, [user?.id, openDialog, category, dateFrom, dateTo]);

    const handleDeletion = (id: string) => {
        console.log(id)
        deleteExpense(id)
            .then(() => {
                success("Wydatek został usunięty")
                if (category === "Wszystkie") {
                    getExpenses(user?.id, null, dateFrom, dateTo).then((res) => setExpenses(res.data));
                } else {
                    getExpenses(user?.id, category, dateFrom, dateTo).then((res) => setExpenses(res.data));
                }
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
                        onClick={() => {
                            setSelectedExpense(params.row as Expense)
                            setOpenDialog(true);
                        }}
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
                    <Typography variant="body2" sx={{mt: 1}}>Zarządzaj swoimi wydatkami i śledź kategorie</Typography>
                </Box>
                <Button
                    variant={'contained'}
                    color={"secondary"}
                    onClick={() => {
                        setSelectedExpense(null);
                        setOpenDialog(true)
                    }}
                >
                    <Add sx={{mr: 1}}/>
                    Dodaj wydatek
                </Button>
            </Box>
            <Box p={2} display="flex" gap={3}>
                <Box flex={1}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={"bold"}>Ostatnie wydatki</Typography>
                                    <Typography variant="body2" color={"text.secondary"}>Przegląd najnowszych
                                        transakcji</Typography>
                                </Box>
                                <Box display="flex" gap={2} alignItems="center">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={selectedDate}
                                            yearsOrder="desc"
                                            maxDate={currentYear}
                                            onMonthChange={(newMonth) => {
                                                setSelectedDate(dayjs(newMonth));
                                            }}
                                            views={['month', 'year']}
                                            format={"MMMM YYYY"}
                                            slotProps={{textField: {size: 'small', sx: {width: 200}}}}
                                        />
                                    </LocalizationProvider>
                                    <TextField
                                        value={category}
                                        defaultValue={"Wszystkie"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        select
                                        sx={{width: 200}}
                                        size="small"
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FilterAltOutlinedIcon/>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    >
                                        {Object.values(categories).map((cat) => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
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
                    initialExpense={selectedExpense}
                />
            </Box>
        </>
    );
}

export default ExpensesPage;