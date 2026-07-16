import {useEffect, useState} from "react";
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
    getAllCategoriesAmount,
} from "../../lib/api.ts";
import {useAuthStore} from "../../store/auth-store.ts";
import type {CategoryAmount, TransactionOverview} from "../../lib/types.ts";
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddTransactionDialog from "./AddTransactionDialog.tsx";
import dayjs, {type Dayjs} from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import RecurringExpenseDialog from "./RecurringExpenseDialog.tsx";
import {useTranslation} from "react-i18next";
// import CategoryExpense from "./CategoryExpense.tsx";
import Tooltip from '@mui/material/Tooltip';
// import ExpenseSummaryCard from "./ExpenseSummaryCard.tsx";
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {useAccountStore} from "../../store/account-store.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {transactionService} from "../../api/transaction-client.ts";
import {useTransactionStore} from "../../store/transaction-store.ts";
import type {RecurringTransaction, Transaction, TransactionFilters} from "../../types/transaction.ts";
import {useRecurringTransactionStore} from "../../store/recurring-transaction-store.ts";

const currentYear = dayjs();

function ExpensesPage() {
    const {t} = useTranslation();
    const user = useAuthStore(s => s.user);

    // const [accounts, setAccounts] = useState<Account[]>([]);
    // const [categories, setCategories] = useState<Category[]>([])
    // const [expenses, setExpenses] = useState<Expense[]>([]);
    // const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);

    const accounts = useAccountStore(state => state.accounts)
    const categories = useCategoryStore(state => state.categories)
    const transactions = useTransactionStore(state => state.transactions)
    const recurringExpenses = useRecurringTransactionStore(state => state.recurringTransactions)

    const setTransactions = useTransactionStore(state => state.setTransactions)
    const setRecurringTransactions = useRecurringTransactionStore(state => state.setRecurringTransactions)

    const deleteTransaction = useTransactionStore(state => state.deleteTransaction)
    const deleteRecurringTransaction = useRecurringTransactionStore(state => state.deleteTransaction)

    const updateRecurringTransaction = useRecurringTransactionStore(state => state.update)

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<Transaction>();
    const [filteredCategory, setFilteredCategory] = useState<string>("Wszystkie");

    // const [categoriesExpenses, setCategoriesExpenses] = useState<CategoryAmount[]>([])
    // const [overview, setOverview] = useState<TransactionOverview>();

    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [editRecurringExpense, setEditRecurringExpense] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    const [categorySelectedDate, setCategorySelectedDate] = useState<Dayjs>(dayjs());
    // const categoryDateFrom = categorySelectedDate.startOf("month").format("YYYY-MM-DD");
    // const categoryDateTo = categorySelectedDate.endOf("month").format("YYYY-MM-DD");

    const paginationModel = {page: 0, pageSize: 5};
    const totalSpending = transactions.reduce((acc, e) => acc + e.price, 0);

    useEffect(() => {
        const fetchExpenses = async () => {
            const filter: TransactionFilters = {
                startDate: dateFrom,
                endDate: dateTo,
                ...(filteredCategory !== "Wszystkie" && {
                    category: filteredCategory,
                }),
            };

            try {
                const expensesResponse = await transactionService.getTransactions(filter);
                setTransactions(expensesResponse);
            } catch (error) {
                //TODO DELETE CONSOLE LOG
                console.error("Błąd podczas pobierania transakcji:", error);
            }
        };

        fetchExpenses();
    }, [openDialog, filteredCategory, dateFrom, dateTo, setTransactions]);

    useEffect(() => {
        const fetchRecurringTransaction = async () => {
            try {
                const response = await transactionService.getRecurringTransactions();
                setRecurringTransactions(response)
            } catch (error) {
                //TODO DELETE CONSOLE LOG
                console.error("Błąd podczas pobierania transakcji rekurencyjnych:", error);
            }
        };
        fetchRecurringTransaction();
    }, [openDialog, setRecurringTransactions])

    // useEffect(() => {
    //     //TODO CHECK IT
    //     getAllCategoriesAmount('EXPENSE', categoryDateFrom, categoryDateTo).then((res) => setCategoriesExpenses(res.data));
    // }, [user?.id, openDialog, categoryDateFrom, categoryDateTo])

    const handleDeletion = (transaction: Transaction) => {
        transactionService.deleteTransaction(transaction.id)
            .then(() => {
                deleteTransaction(transaction)
                success(t('expenses.notifications.delete.success'))
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    };

    const handleRecurringDeletion = (transaction: RecurringTransaction) => {
        transactionService.deleteRecurringTransaction(transaction.id)
            .then(() => {
                deleteRecurringTransaction(transaction)
                success(t('expenses.notifications.delete.success'))
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    }

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };


    //COLUMNS WITH EXPENSES
    const columns: GridColDef[] = [
        {
            field: 'accountName',
            //TODO ZMIENIC NA WIELOJEZYCZNOSC
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
                // const account = accounts.find(a => a.name === params.row.accountName);
                // const symbol = account?.currency?.symbol ?? 'zł';
                const symbol = 'zł';
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
                                setSelectedTransaction(params.row as Transaction)
                                setOpenDialog(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.delete")} arrow>
                        <IconButton
                            color="error"
                            onClick={() => handleDeletion(params.row)}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ]

    //COLUMNS WITH RECURRING EXPENSES
    const recurringColumns: GridColDef[] = [
        {
            field: 'accountName',
            //TODO ZMIENIC NA WIELOJEZYCZNOSC
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
            //TODO WIELOJĘZYCZNBOSC
            headerName: "Aktywność",
            flex: 0.5,
            renderCell: (params) => {
                const isActive = params.row.active;

                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                onChange={async () => {
                                    try {
                                        const response = await transactionService.deactivateTransaction(params.row.id);
                                        const transaction: RecurringTransaction = {
                                            ...params.row,
                                            active: !params.row.active,
                                        };
                                        updateRecurringTransaction(transaction)
                                    } catch (e) {
                                        //TODO DELETE CONSOLE LOG AND ADD NOTIFICATION
                                        console.error(e);
                                    }
                                }}
                                color="secondary"
                            />
                        }
                        label={false}
                        sx={{minWidth: "140px"}}
                    />
                );
            }
        },
        {
            field: 'price',
            headerName: t('expenses.page.expensesTable.price'),
            flex: 0.8,
            renderCell: (params) => {
                // const account = accounts.find(a => a.name === params.row.accountName);
                // const symbol = account?.currency?.symbol ?? 'zł';
                const symbol = 'zł';
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
                                setSelectedRecurringTransaction(params.row as RecurringTransaction)
                                setEditRecurringExpense(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("expenses.page.expensesTable.tooltip.delete")} arrow>
                        <IconButton
                            color="error"
                            onClick={() => handleRecurringDeletion(params.row)}
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
                        setSelectedTransaction(null);
                        setOpenDialog(true)
                    }}
                >
                    <Add sx={{mr: 1}}/>
                    {t('expenses.page.add')}
                </Button>
            </Box>
            {/*// SHORT SUMMARY*/}
            {/*<Box p={2} display="grid" gap={2}*/}
            {/*     sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>*/}
            {/*    <ExpenseSummaryCard*/}
            {/*        type="totalExpenses"*/}
            {/*        title="Całkowite wydatki"*/}
            {/*        description=" względem poprzedniego miesiąca"*/}
            {/*        amount={overview?.totalAmount}*/}
            {/*        change={overview?.totalAmountChangePercentage}*/}
            {/*        // currency={user?.currency.symbol || 'zł'}*/}
            {/*        currency={'zł'}*/}
            {/*        accentColor="#E53935"*/}
            {/*        icon={<AttachMoneyOutlined fontSize="medium"/>}*/}
            {/*    />*/}
            {/*    <ExpenseSummaryCard*/}
            {/*        type="totalTransactions"*/}
            {/*        title="Transakcje"*/}
            {/*        description=" transakcji w tym miesiącu"*/}
            {/*        amount={overview?.expenseCount}*/}
            {/*        change={overview?.expenseCountChangePercentage}*/}
            {/*        accentColor="#70B2B1"*/}
            {/*        icon={<ReceiptIcon fontSize="medium"/>}*/}
            {/*    />*/}
            {/*    <ExpenseSummaryCard*/}
            {/*        type="Average"*/}
            {/*        title="Średnia dzienna"*/}
            {/*        description="na podstawie 30 dni"*/}
            {/*        amount={overview?.averageAmount}*/}
            {/*        // currency={user?.currency.symbol || 'zł'}*/}
            {/*        currency={'zł'}*/}
            {/*        accentColor="#5C86D3"*/}
            {/*        icon={<TrendingUpIcon fontSize="medium"/>}*/}
            {/*    />*/}

            {/*</Box>*/}
            {/*// EXPENSES TABLE*/}
            <Box ml={2} mr={2}>
                <Card
                    data-testid="expenses-table-card"
                >
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
                                    {/*//TODO ZMIENIC NA WIELOJEZYCZNOSC*/}
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
                            rows={transactions}
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
            {/*EXPENSES FOR CATEGORIES*/}
            <Box p={2}>
                <Card
                    data-testid='categories-table-card'
                >
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
                        {/*<Box*/}
                        {/*    sx={{*/}
                        {/*        display: 'grid',*/}
                        {/*        gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'},*/}
                        {/*        gap: 2,*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {Object.values(categoriesExpenses).map((cat, i) => {*/}
                        {/*        const matchedCategory = categories.find(c => c.name === cat.category);*/}

                        {/*        return (*/}
                        {/*            <CategoryExpense*/}
                        {/*                key={i}*/}
                        {/*                categoryAmount={cat}*/}
                        {/*                color={matchedCategory?.color}*/}
                        {/*                // currency={user?.currency.symbol || ""}*/}
                        {/*                currency={"zł"}*/}
                        {/*            />*/}
                        {/*        );*/}
                        {/*    })}*/}

                        {/*</Box>*/}
                    </CardContent>
                </Card>
            </Box>

            {/*// RECURRING EXPENSES TABLE*/}
            <Box p={2} display="flex" gap={3}>
                <Box flex={1}>
                    <Card
                        data-testid='recurring-expenses-table-card'
                    >
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
            </Box>
            <AddTransactionDialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false)
                    setSelectedTransaction(null)
                }}
                initialTransaction={selectedTransaction}
                accounts={accounts}
                categories={categories}
            />
            {/*<RecurringExpenseDialog*/}
            {/*    open={editRecurringExpense}*/}
            {/*    onClose={() => setEditRecurringExpense(false)}*/}
            {/*    recurringExpense={selectedRecurringTransaction}*/}
            {/*    accounts={accounts}*/}
            {/*    categories={categories}*/}
            {/*/>*/}
        </>
    );
}

export default ExpensesPage;