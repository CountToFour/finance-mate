import {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Button, MenuItem, TextField,
} from "@mui/material";
import {Add, AttachMoneyOutlined} from "@mui/icons-material";
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip
    , ResponsiveContainer
} from "recharts";
import {
    deleteTransaction,
    deleteRecurringTransaction,
    getAllCategoriesAmount,
    getAllRecurringExpenses, getExpenseOverview,
    getExpenses
} from "../../lib/api.ts";
import {useAuthStore} from "../../store/auth.ts";
import type {CategoryAmount, Expense, ExpenseOverview, RecurringExpense} from "../../lib/types.ts";
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddExpenseDialog from "./AddExpenseDialog.tsx";
import dayjs, {type Dayjs} from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RecurringExpenseDialog from "./RecurringExpenseDialog.tsx";
import {useTranslation} from "react-i18next";
import CategoryExpense from "./CategoryExpense.tsx";
import Tooltip from '@mui/material/Tooltip';
import ExpenseSummaryCard from "./ExpenseSummaryCard.tsx";
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const COLORS = ["#5C86D3", "#A175BF", "#CDB557", "#7AB6D1"];
const categories = ["Wszystkie", "Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"];
const currentYear = dayjs();

function ExpensesPage() {
    const {t} = useTranslation();
    const user = useAuthStore(s => s.user);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpense>();
    const [category, setCategory] = useState<string>("Wszystkie");
    const [categoriesExpenses, setCategoriesExpenses] = useState<CategoryAmount[]>([])
    const [overview, setOverview] = useState<ExpenseOverview>();

    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [editRecurringExpense, setEditRecurringExpense] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    const [categorySelectedDate, setCategorySelectedDate] = useState<Dayjs>(dayjs());
    const categoryDateFrom = categorySelectedDate.startOf("month").format("YYYY-MM-DD");
    const categoryDateTo = categorySelectedDate.endOf("month").format("YYYY-MM-DD");

    const paginationModel = {page: 0, pageSize: 5};
    const totalSpending = expenses.reduce((acc, e) => acc + e.price, 0);

    useEffect(() => {
        if (category === "Wszystkie") {
            getExpenses(null, dateFrom, dateTo).then((res) => setExpenses(res.data));
        } else {
            getExpenses(category, dateFrom, dateTo).then((res) => setExpenses(res.data));
        }
        getExpenseOverview('EXPENSE', dayjs().startOf("month").format("YYYY-MM-DD"),
            dayjs().endOf("month").format("YYYY-MM-DD")).then((res) => setOverview(res.data));
    }, [user?.id, openDialog, category, dateFrom, dateTo]);

    useEffect(() => {
        getAllRecurringExpenses().then((res) => setRecurringExpenses(res.data));
    }, [editRecurringExpense, user?.id])

    useEffect(() => {
        getAllCategoriesAmount('EXPENSE', categoryDateFrom, categoryDateTo).then((res) => setCategoriesExpenses(res.data));
    }, [user?.id, openDialog, categoryDateFrom, categoryDateTo])

    const handleDeletion = (id: string) => {
        deleteTransaction(id)
            .then(() => {
                success(t('expenses.notifications.delete.success'))
                if (category === "Wszystkie") {
                    getExpenses( null, dateFrom, dateTo).then((res) => setExpenses(res.data));
                } else {
                    getExpenses(category, dateFrom, dateTo).then((res) => setExpenses(res.data));
                }
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    };

    const handleRecurringDeletion = (id: string) => {
        deleteRecurringTransaction(id)
            .then(() => {
                success(t('expenses.notifications.delete.success'))
                getAllRecurringExpenses().then((res) => setRecurringExpenses(res.data));
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    }

    const columns: GridColDef[] = [
        {
            field: 'expenseDate',
            headerName: t('expenses.page.expensesTable.date'),
            flex: 1,
        },
        {
            field: 'description',
            headerName: t('expenses.page.expensesTable.description'),
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'category',
            headerName: t('expenses.page.expensesTable.category'),
            flex: 1.5,
        },
        {
            field: 'price',
            headerName: t('expenses.page.expensesTable.price'),
            flex: 1,
            valueFormatter: value => `-${value} zł`,
            cellClassName: 'priceNegative',
        },
        {
            field: 'actions',
            headerName: t('expenses.page.expensesTable.actions'),
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
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.edit")} arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedExpense(params.row as Expense)
                                setOpenDialog(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.delete")} arrow>
                        <IconButton
                            color="error"
                            onClick={() => handleDeletion(params.row.id)}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ]

    const recurringColumns: GridColDef[] = [
        {
            field: 'expenseDate',
            headerName: t('expenses.page.expensesTable.date'),
            flex: 1,
        },
        {
            field: 'description',
            headerName: t('expenses.page.expensesTable.description'),
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'category',
            headerName: t('expenses.page.expensesTable.category'),
            flex: 1.5,
        },
        {
            field: 'price',
            headerName: t('expenses.page.expensesTable.price'),
            flex: 1,
            valueFormatter: value => `-${value} zł`,
            cellClassName: 'priceNegative',
        },
        {
            field: 'actions',
            headerName: t('expenses.page.expensesTable.actions'),
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
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.edit")} arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedRecurringExpense(params.row as RecurringExpense)
                                setEditRecurringExpense(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.delete")} arrow>
                        <IconButton
                            color="error"
                            onClick={() => handleRecurringDeletion(params.row.id)}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ]

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={"bold"}
                                color={"secondary"}>{t('expenses.page.label')}</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>{t('expenses.page.secondLabel')}</Typography>
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
                    {t('expenses.page.add')}
                </Button>
            </Box>
            <Box p={2} display="grid" gap={2} sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <ExpenseSummaryCard
                    type="totalExpenses"
                    title="Całkowite wydatki"
                    description=" względem poprzedniego miesiąca"
                    amount={overview?.totalAmount}
                    change={overview?.totalAmountChangePercentage}
                    currency="zł"
                    accentColor="#E53935" // czerwony jak na podglądzie; możesz też użyć 'error.main'
                    icon={<AttachMoneyOutlined fontSize="medium" />}
                />
                <ExpenseSummaryCard
                    type="totalTransactions"
                    title="Transakcje"
                    description=" transakcji w tym miesiącu"
                    amount={overview?.expenseCount}
                    change={overview?.expenseCountChangePercentage}
                    accentColor="#70B2B1"
                    icon={<ReceiptIcon fontSize="medium" />}
                />
                <ExpenseSummaryCard
                    type="Average"
                    title="Średnia dzienna"
                    description="na podstawie 30 dni"
                    amount={overview?.averageAmount}
                    currency="zł"
                    accentColor="#5C86D3" // czerwony jak na podglądzie; możesz też użyć 'error.main'
                    icon={<TrendingUpIcon fontSize="medium" />}
                />

            </Box>
            <Box ml={2} mr={2}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="subtitle1"
                                            fontWeight={"bold"}>{t('expenses.page.expensesTable.label')}</Typography>
                                <Typography variant="body2"
                                            color={"text.secondary"}>{t('expenses.page.expensesTable.secondLabel')}</Typography>
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
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                sx: {width: 250},
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                aria-label="Poprzedni miesiąc"
                                                                size="small"
                                                                edge="start"
                                                                onClick={() => setSelectedDate(prev => prev.subtract(1, 'month'))}
                                                                tabIndex={-1}
                                                            >
                                                                <ChevronLeftIcon fontSize="small"/>
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="Następny miesiąc"
                                                                size="small"
                                                                edge="start"
                                                                onClick={() => setSelectedDate(prev => prev.add(1, 'month'))}
                                                                disabled={selectedDate.add(1, 'month').isAfter(currentYear, 'month')}
                                                                tabIndex={-1}
                                                            >
                                                                <ChevronRightIcon fontSize="small"/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                                <TextField
                                    value={category}
                                    defaultValue={"Wszystkie"}
                                    onChange={(e) => setCategory(e.target.value)}
                                    select
                                    sx={{width: 250}}
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
            <Box p={2}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="subtitle1"
                                            fontWeight={"bold"}>{t('expenses.page.categories.label')}</Typography>
                                <Typography variant="body2"
                                            color={"text.secondary"}>{t('expenses.page.categories.secondLabel')}</Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={categorySelectedDate}
                                        yearsOrder="desc"
                                        maxDate={currentYear}
                                        onMonthChange={(newMonth) => {
                                            setCategorySelectedDate(dayjs(newMonth));
                                        }}
                                        views={['month', 'year']}
                                        format={"MMMM YYYY"}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                sx: {width: 250},
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton
                                                                aria-label="Poprzedni miesiąc"
                                                                size="small"
                                                                edge="start"
                                                                onClick={() => setCategorySelectedDate(prev => prev.subtract(1, 'month'))}
                                                                tabIndex={-1}
                                                            >
                                                                <ChevronLeftIcon fontSize="small"/>
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="Następny miesiąc"
                                                                size="small"
                                                                edge="start"
                                                                onClick={() => setCategorySelectedDate(prev => prev.add(1, 'month'))}
                                                                disabled={categorySelectedDate.add(1, 'month').isAfter(currentYear, 'month')}
                                                                tabIndex={-1}
                                                            >
                                                                <ChevronRightIcon fontSize="small"/>
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'},
                                gap: 2,
                            }}
                        >
                            {Object.values(categoriesExpenses).map((cat, i) => (
                                <CategoryExpense
                                    categoryAmount={cat}
                                    color={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <Box p={2} display="flex" gap={3}>
                <Box flex={1}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box>
                                    <Typography variant="subtitle1"
                                                fontWeight={"bold"}>{t('expenses.page.recurringTable.label')}</Typography>
                                    <Typography variant="body2"
                                                color={"text.secondary"}>{t('expenses.page.recurringTable.secondLabel')}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{my: 1}}/>
                            <DataGrid
                                rows={recurringExpenses}
                                columns={recurringColumns}
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
                                    <RechartsTooltip/>
                                </PieChart>
                            </ResponsiveContainer>
                            <Typography variant="subtitle1" align="center" mt={2}>
                                Całkowite wydatki: {totalSpending.toFixed(2)} zł
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <AddExpenseDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                initialExpense={selectedExpense}
            />
            <RecurringExpenseDialog
                open={editRecurringExpense}
                onClose={() => setEditRecurringExpense(false)}
                recurringExpense={selectedRecurringExpense}
            />
        </>
    );
}

export default ExpensesPage;