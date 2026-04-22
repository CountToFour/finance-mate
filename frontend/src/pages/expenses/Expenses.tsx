import React, {useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Button, MenuItem, TextField, Chip, Switch, FormControlLabel,
} from "@mui/material";
import {Add, AttachMoneyOutlined} from "@mui/icons-material";
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
    deleteTransaction,
    deleteRecurringTransaction,
    getAllCategoriesAmount,
    getAllRecurringExpenses, getTransactionOverview,
    getExpenses, getAccounts, getCategories, deactivateRecurringTransaction
} from "../../lib/api.ts";
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {useAuthStore} from "../../store/auth.ts";
import type {Account, Category, CategoryAmount, Expense, TransactionOverview, RecurringExpense} from "../../lib/types.ts";
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

const currentYear = dayjs();

function ExpensesPage() {
    const {t} = useTranslation();
    const user = useAuthStore(s => s.user);

    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpense | undefined>();
    const [filteredCategory, setFilteredCategory] = useState<string>("Wszystkie");

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
    const queryClient = useQueryClient();

    // ✅ POPRAWKA: Queries pozostają tak jak były, są napisane świetnie.
    const expensesQuery = useQuery<Expense[]>({
        queryKey: ['expenses', filteredCategory, dateFrom, dateTo],
        queryFn: () => getExpenses(filteredCategory === "Wszystkie" ? null : filteredCategory, dateFrom, dateTo).then(r => r.data),
        enabled: !!user?.id,
    });

    const overviewQuery = useQuery<TransactionOverview | undefined>({
        queryKey: ['transactionOverview', 'EXPENSE'],
        queryFn: () => getTransactionOverview('EXPENSE', null, null).then(r => r.data),
        enabled: !!user?.id,
    });

    const accountsQuery = useQuery<Account[]>({ queryKey: ['accounts'], queryFn: () => getAccounts().then(r => r.data), enabled: !!user?.id });

    const categoriesQuery = useQuery<Category[]>({ queryKey: ['categories', 'EXPENSE'], queryFn: () => getCategories('EXPENSE').then(r => r.data), enabled: !!user?.id });

    const recurringQuery = useQuery<RecurringExpense[]>({ queryKey: ['recurringExpenses'], queryFn: () => getAllRecurringExpenses().then(r => r.data), enabled: !!user?.id });

    const categoriesAmountQuery = useQuery<CategoryAmount[]>({ queryKey: ['categoriesAmount', 'EXPENSE', categoryDateFrom, categoryDateTo], queryFn: () => getAllCategoriesAmount('EXPENSE', categoryDateFrom, categoryDateTo).then(r => r.data), enabled: !!user?.id });

    const accounts = accountsQuery.data ?? [];
    const expenses = expensesQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    const recurringExpenses = recurringQuery.data ?? [];
    const categoriesExpenses = categoriesAmountQuery.data ?? [];
    const overview = overviewQuery.data;

    // ✅ POPRAWKA: Usunięto antywzorzec (dwa hooki useEffect)!
    // Odświeżanie danych dzieje się teraz w propie onSuccess modalów.

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSuccess: () => {
            success(t('expenses.notifications.delete.success'))
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['transactionOverview'] });
        },
        onError: () => error(t('expenses.notifications.delete.error'))
    });

    const handleDeletion = (id: string) => {
        deleteMutation.mutate(id);
    };

    const deleteRecurringMutation = useMutation({
        mutationFn: (id: string) => deleteRecurringTransaction(id),
        onSuccess: () => {
            success(t('expenses.notifications.delete.success'))
            queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] });
        },
        onError: () => error(t('expenses.notifications.delete.error'))
    });

    const handleRecurringDeletion = (id: string) => {
        deleteRecurringMutation.mutate(id);
    }

    // ✅ POPRAWKA: Nowa mutacja do aktywacji/dezaktywacji subskrypcji
    const toggleRecurringMutation = useMutation({
        mutationFn: (id: string) => deactivateRecurringTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] });
            success("Pomyślnie zaktualizowano status.");
        },
        onError: () => error("Nie udało się zaktualizować statusu.")
    });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const columns: GridColDef[] = [
        {
            field: 'accountName',
            headerName: t('Nazwa konta'),
            flex: 1,
            renderCell: (params) => {
                const account = accounts.find(a => a.name === params.value);
                if (!account) return params.value;
                const background = hexToRgba(account.color, 0.2)
                return (
                    <Chip label={account?.name}
                          variant={"outlined"}
                          sx={{
                              color: account?.color,
                              borderColor: account?.color,
                              backgroundColor: background,
                          }}/>
                );
            }
        },
        {
            field: 'createdAt',
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
            flex: 1,
            renderCell: (params) => {
                const category = categories.find(a => a.name === params.value);
                if (!category) return params.value;
                const background = hexToRgba(category.color, 0.2)
                return (
                    <Chip label={category?.name}
                          variant={"outlined"}
                          sx={{
                              color: category?.color,
                              borderColor: category?.color,
                              backgroundColor: background,
                          }}/>
                );
            }
        },
        {
            field: 'price',
            headerName: t('expenses.page.expensesTable.price'),
            flex: 0.8,
            renderCell: (params) => {
                const account = accounts.find(a => a.name === params.row.accountName);
                const symbol = account?.currency?.symbol ?? 'zł';
                return `${params.value} ${symbol}`;
            },
            cellClassName: 'priceNegative',
        },
        {
            field: 'actions',
            headerName: t('expenses.page.expensesTable.actions'),
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
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
                            disabled={deleteMutation.isPending} // Blokada przy usuwaniu
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
            field: 'accountName',
            headerName: t('Nazwa konta'),
            flex: 1,
            renderCell: (params) => {
                const account = accounts.find(a => a.name === params.value);
                if (!account) return params.value;
                const background = hexToRgba(account.color, 0.2)
                return (
                    <Chip label={account?.name}
                          variant={"outlined"}
                          sx={{
                              color: account?.color,
                              borderColor: account?.color,
                              backgroundColor: background,
                          }}/>
                );
            }
        },
        {
            field: 'createdAt',
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
            flex: 1,
            renderCell: (params) => {
                const category = categories.find(a => a.name === params.value);
                if (!category) return params.value;
                const background = hexToRgba(category.color, 0.2)
                return (
                    <Chip label={category?.name}
                          variant={"outlined"}
                          sx={{
                              color: category?.color,
                              borderColor: category?.color,
                              backgroundColor: background,
                          }}/>
                );
            }
        },
        {
            field: 'active',
            headerName: "Aktywność",
            flex: 0.5,
            renderCell: (params) => {
                const isActive = params.row.active;
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                // ✅ POPRAWKA: Czyste użycie useMutation zamiast async/await
                                onChange={() => toggleRecurringMutation.mutate(params.row.id)}
                                // Blokuje przełącznik, gdy czekamy na serwer
                                disabled={toggleRecurringMutation.isPending}
                                color="secondary"
                            />
                        }
                        label={false}
                        sx={{ minWidth: "140px" }}
                    />
                );
            }
        },
        {
            field: 'price',
            headerName: t('expenses.page.expensesTable.price'),
            flex: 0.8,
            renderCell: (params) => {
                const account = accounts.find(a => a.name === params.row.accountName);
                const symbol = account?.currency?.symbol ?? 'zł';
                return `${params.value} ${symbol}`;
            },
            cellClassName: 'priceNegative',
        },
        {
            field: 'actions',
            headerName: t('expenses.page.expensesTable.actions'),
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
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
                            disabled={deleteRecurringMutation.isPending}
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
                    data-testid="add-expense-button"
                    onClick={() => {
                        setSelectedExpense(null);
                        setOpenDialog(true)
                    }}
                >
                    <Add sx={{mr: 1}}/>
                    {t('expenses.page.add')}
                </Button>
            </Box>

            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <ExpenseSummaryCard
                    type="totalExpenses"
                    title="Całkowite wydatki"
                    description=" względem poprzedniego miesiąca"
                    amount={overview?.totalAmount ?? 0}
                    change={overview?.totalAmountChangePercentage ?? 0}
                    currency={user?.currency.symbol || 'zł'}
                    accentColor="#E53935"
                    icon={<AttachMoneyOutlined fontSize="medium"/>}
                />
                <ExpenseSummaryCard
                    type="totalTransactions"
                    title="Transakcje"
                    description=" transakcji w tym miesiącu"
                    amount={overview?.expenseCount ?? 0}
                    change={overview?.expenseCountChangePercentage ?? 0}
                    accentColor="#70B2B1"
                    icon={<ReceiptIcon fontSize="medium"/>}
                />
                <ExpenseSummaryCard
                    type="Average"
                    title="Średnia dzienna"
                    description="na podstawie 30 dni"
                    amount={overview?.averageAmount ?? 0}
                    currency={user?.currency.symbol || 'zł'}
                    accentColor="#5C86D3"
                    icon={<TrendingUpIcon fontSize="medium"/>}
                />

            </Box>

            <Box ml={2} mr={2}>
                <Card data-testid="expenses-table-card">
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
                                        onMonthChange={(newMonth) => setSelectedDate(dayjs(newMonth))}
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
                                    value={filteredCategory}
                                    defaultValue={"Wszystkie"}
                                    onChange={(e) => setFilteredCategory(e.target.value)}
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
                                    <MenuItem value="Wszystkie">Wszystkie</MenuItem>
                                    {Object.values(categories).map((cat) => (
                                        <MenuItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>

                        <Divider sx={{my: 1}}/>
                        <DataGrid
                            rows={expenses}
                            columns={columns}
                            loading={expensesQuery.isLoading} // ✅ POPRAWKA: Automatyczny spinner z TanStack Query
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
                <Card data-testid='categories-table-card'>
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
                                        onMonthChange={(newMonth) => setCategorySelectedDate(dayjs(newMonth))}
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
                            {Object.values(categoriesExpenses).map((cat, i) => {
                                const matchedCategory = categories.find(c => c.name === cat.category);
                                return (
                                    <CategoryExpense
                                        key={i}
                                        categoryAmount={cat}
                                        color={matchedCategory?.color}
                                        currency={user?.currency.symbol || ""}
                                    />
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Box p={2} display="flex" gap={3}>
                <Box flex={1}>
                    <Card data-testid='recurring-expenses-table-card'>
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
                                loading={recurringQuery.isLoading} // ✅ POPRAWKA: Automatyczny spinner
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
            </Box>

            <AddExpenseDialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false)
                    setSelectedExpense(null)
                }}
                // ✅ POPRAWKA: Przekazujemy funkcję odświeżającą do użycia po poprawnym zapisie w Dialogu!
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['expenses'] });
                    queryClient.invalidateQueries({ queryKey: ['transactionOverview'] });
                    queryClient.invalidateQueries({ queryKey: ['categoriesAmount'] });
                    setOpenDialog(false);
                    setSelectedExpense(null);
                }}
                initialExpense={selectedExpense}
                accounts={accounts}
                categories={categories}
            />

            <RecurringExpenseDialog
                open={editRecurringExpense}
                onClose={() => setEditRecurringExpense(false)}
                // ✅ POPRAWKA: Przekazujemy funkcję odświeżającą analogicznie jak wyżej
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] });
                    setEditRecurringExpense(false);
                }}
                recurringExpense={selectedRecurringExpense}
                accounts={accounts}
                categories={categories}
            />
        </>
    );
}

export default ExpensesPage;