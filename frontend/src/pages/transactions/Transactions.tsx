import {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {Add, AttachMoneyOutlined} from "@mui/icons-material";
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddTransactionDialog from "./AddTransactionDialog.tsx";
import dayjs, {type Dayjs} from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {useTranslation} from "react-i18next";
import Tooltip from '@mui/material/Tooltip';
import {useAccountStore} from "../../store/account-store.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {transactionService} from "../../api/transaction-client.ts";
import {useTransactionStore} from "../../store/transaction-store.ts";
import type {
    RecurringTransaction,
    Transaction,
    TransactionFilters,
    TransactionsOverview
} from "../../types/transaction.ts";
import {useRecurringTransactionStore} from "../../store/recurring-transaction-store.ts";
import RecurringTransactionDialog from "./RecurringTransactionDialog.tsx";
import TransactionSummaryCard from "./TransactionSummaryCard.tsx";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryTransactionOverview from "./CategoryTransactionOverview.tsx";

const currentYear = dayjs();

function TransactionPage() {
    const {t} = useTranslation();

    const accounts = useAccountStore(state => state.accounts)
    const categories = useCategoryStore(state => state.categories)
    const transactions = useTransactionStore(state => state.transactions)
    const recurringTransactions = useRecurringTransactionStore(state => state.recurringTransactions)

    const setTransactions = useTransactionStore(state => state.setTransactions)
    const setRecurringTransactions = useRecurringTransactionStore(state => state.setRecurringTransactions)

    const deleteTransaction = useTransactionStore(state => state.deleteTransaction)
    const deleteRecurringTransaction = useRecurringTransactionStore(state => state.deleteTransaction)

    const updateRecurringTransaction = useRecurringTransactionStore(state => state.update)

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<RecurringTransaction | null>(null);
    const [filteredCategory, setFilteredCategory] = useState<string>("Wszystkie");

    // const [categoriesExpenses, setCategoriesExpenses] = useState<CategoryAmount[]>([])
    const [overview, setOverview] = useState<TransactionsOverview | null>(null);

    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [editRecurringTransaction, setEditRecurringTransaction] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    // const [categorySelectedDate, setCategorySelectedDate] = useState<Dayjs>(dayjs());
    // const categoryDateFrom = categorySelectedDate.startOf("month").format("YYYY-MM-DD");
    // const categoryDateTo = categorySelectedDate.endOf("month").format("YYYY-MM-DD");

    const paginationModel = {page: 0, pageSize: 5};

    useEffect(() => {
        const fetchExpenses = async () => {
            const filter: TransactionFilters = {
                startDate: dateFrom,
                endDate: dateTo,
                ...(filteredCategory !== "Wszystkie" && {
                    category: filteredCategory,
                }),
            };

            const transactionsResponse = await transactionService.getTransactions(filter);
            setTransactions(transactionsResponse);
        };

        fetchExpenses();
    }, [filteredCategory, dateFrom, dateTo, setTransactions]);

    useEffect(() => {
        const fetchRecurringTransaction = async () => {
            const response = await transactionService.getRecurringTransactions();
            setRecurringTransactions(response)
        };
        fetchRecurringTransaction();
    }, [setRecurringTransactions])

    useEffect(() => {
        const fetchOverview = async () => {
            const overview = await transactionService.getTransactionOverview();
            setOverview(overview)
        }

        fetchOverview();
    }, [transactions]);

    // useEffect(() => {
    //     //TODO CHECK IT
    //     getAllCategoriesAmount('EXPENSE', categoryDateFrom, categoryDateTo).then((res) => setCategoriesExpenses(res.data));
    // }, [user?.id, openDialog, categoryDateFrom, categoryDateTo])

    const handleDeletion = (transaction: Transaction) => {
        transactionService.deleteTransaction(transaction.id)
            .then(() => {
                deleteTransaction(transaction)
                success(t('transactions.notifications.delete.success'))
            })
            .catch(() => {
                error(t('transactions.notifications.delete.error'))
            });
    };

    const handleRecurringDeletion = (transaction: RecurringTransaction) => {
        transactionService.deleteRecurringTransaction(transaction.id)
            .then(() => {
                deleteRecurringTransaction(transaction)
                success(t('transactions.notifications.delete.success'))
            })
            .catch(() => {
                error(t('transactions.notifications.delete.error'))
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
            headerName: t('transactions.page.table.account'),
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
            headerName: t('transactions.page.table.date'),
            flex: 1,
        },
        {
            field: 'description',
            headerName: t('transactions.page.table.description'),
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'categoryName',
            headerName: t('transactions.page.table.category'),
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
            headerName: t('transactions.page.table.price'),
            flex: 0.8,
            renderCell: (params) => {
                // const account = accounts.find(a => a.name === params.row.accountName);
                // const symbol = account?.currency?.symbol ?? 'zł';
                const symbol = 'zł';
                return `${params.value} ${symbol}`;
            },
            cellClassName: (params) => {
                return params.value < 0 ? 'priceNegative' : 'pricePositive'
            },
        },
        {
            field: 'actions',
            headerName: t('transactions.page.table.actions'),
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
                    <Tooltip title={t("transactions.page.table.tooltip.edit")} arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedTransaction(params.row as Transaction)
                                setOpenDialog(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("transactions.page.table.tooltip.delete")} arrow>
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
            headerName: t('transactions.page.table.account'),
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
            headerName: t('transactions.page.recurringTable.date'),
            flex: 1,
        },
        {
            field: 'description',
            headerName: t('transactions.page.table.description'),
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'categoryName',
            headerName: t('transactions.page.table.category'),
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
            headerName: t("transactions.page.recurringTable.active"),
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
                                        await transactionService.deactivateTransaction(params.row.id);
                                        const transaction: RecurringTransaction = {
                                            ...params.row,
                                            active: !params.row.active,
                                        };
                                        updateRecurringTransaction(transaction)
                                    } catch {
                                        error(t("transactions.notifications.deactivate.error"))
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
            headerName: t('transactions.page.table.price'),
            flex: 0.8,
            renderCell: (params) => {
                // const account = accounts.find(a => a.name === params.row.accountName);
                // const symbol = account?.currency?.symbol ?? 'zł';
                const symbol = 'zł';
                return `${params.value} ${symbol}`;
            },
            cellClassName: (params) => {
                return params.value < 0 ? 'priceNegative' : 'pricePositive'
            },
        },
        {
            field: 'actions',
            headerName: t('transactions.page.table.actions'),
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
                    <Tooltip title={t("transactions.page.table.tooltip.edit")} arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedRecurringTransaction(params.row as RecurringTransaction)
                                setEditRecurringTransaction(true);
                            }}
                        >
                            <EditOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("transactions.page.table.tooltip.delete")} arrow>
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
                                color={"secondary"}>{t('transactions.page.label')}</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>{t('transactions.page.secondLabel')}</Typography>
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
                    {t('transactions.page.add')}
                </Button>
            </Box>
            {/*// SHORT SUMMARY*/}
            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <TransactionSummaryCard
                    type="totalValue"
                    title={t("transactions.page.overview.totalValue.title")}
                    description={t("transactions.page.overview.totalValue.description")}
                    amount={overview?.totalValue.toFixed(2)}
                    change={overview?.totalValuePercentageChange.toFixed(2)}
                    // currency={user?.currency.symbol || 'zł'}
                    currency={'zł'}
                    accentColor={overview?.totalValue < 0 ? "#E53935" : "green"}
                    icon={<AttachMoneyOutlined fontSize="medium"/>}
                />
                <TransactionSummaryCard
                    type="totalAmount"
                    title={t("transactions.page.overview.totalAmount.title")}
                    description={t("transactions.page.overview.totalAmount.description")}
                    amount={overview?.totalAmount}
                    change={overview?.totalAmountPercentageChange}
                    accentColor="#70B2B1"
                    icon={<ReceiptIcon fontSize="medium"/>}
                />
                <TransactionSummaryCard
                    type="Average"
                    title={t("transactions.page.overview.average.title")}
                    description={t("transactions.page.overview.average.description")}
                    amount={overview?.dailyAverage.toFixed(2)}
                    // currency={user?.currency.symbol || 'zł'}
                    currency={'zł'}
                    accentColor="#5C86D3"
                    icon={<TrendingUpIcon fontSize="medium"/>}
                />
            </Box>
            {/*// EXPENSES TABLE*/}
            <Box ml={2} mr={2}>
                <Card
                    data-testid="expenses-table-card"
                >
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="subtitle1"
                                            fontWeight={"bold"}>{t('transactions.page.table.label')}</Typography>
                                <Typography variant="body2"
                                            color={"text.secondary"}>{t('transactions.page.table.secondLabel')}</Typography>
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
                                    <MenuItem value="Wszystkie">{t('transactions.page.table.categories.all')}</MenuItem>

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
                                '& .MuiDataGrid-cell.pricePositive': {
                                    color: "green",
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>
            {/*EXPENSES FOR CATEGORIES*/}
            {/*<Box ml={2} mr={2} mt={2}>*/}
            {/*    <Card*/}
            {/*        data-testid='categories-table-card'*/}
            {/*    >*/}
            {/*        <CardContent>*/}
            {/*            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>*/}
            {/*                <Box>*/}
            {/*                    <Typography variant="subtitle1"*/}
            {/*                                fontWeight={"bold"}>{t('expenses.page.categories.label')}</Typography>*/}
            {/*                    <Typography variant="body2"*/}
            {/*                                color={"text.secondary"}>{t('expenses.page.categories.secondLabel')}</Typography>*/}
            {/*                </Box>*/}
            {/*                <Box display="flex" gap={2} alignItems="center">*/}
            {/*                    <LocalizationProvider dateAdapter={AdapterDayjs}>*/}
            {/*                        <DatePicker*/}
            {/*                            value={categorySelectedDate}*/}
            {/*                            yearsOrder="desc"*/}
            {/*                            maxDate={currentYear}*/}
            {/*                            onMonthChange={(newMonth) => {*/}
            {/*                                setCategorySelectedDate(dayjs(newMonth));*/}
            {/*                            }}*/}
            {/*                            views={['month', 'year']}*/}
            {/*                            format={"MMMM YYYY"}*/}
            {/*                            slotProps={{*/}
            {/*                                textField: {*/}
            {/*                                    size: 'small',*/}
            {/*                                    sx: {width: 250},*/}
            {/*                                    InputProps: {*/}
            {/*                                        startAdornment: (*/}
            {/*                                            <InputAdornment position="start">*/}
            {/*                                                <IconButton*/}
            {/*                                                    aria-label="Poprzedni miesiąc"*/}
            {/*                                                    size="small"*/}
            {/*                                                    edge="start"*/}
            {/*                                                    onClick={() => setCategorySelectedDate(prev => prev.subtract(1, 'month'))}*/}
            {/*                                                    tabIndex={-1}*/}
            {/*                                                >*/}
            {/*                                                    <ChevronLeftIcon fontSize="small"/>*/}
            {/*                                                </IconButton>*/}
            {/*                                                <IconButton*/}
            {/*                                                    aria-label="Następny miesiąc"*/}
            {/*                                                    size="small"*/}
            {/*                                                    edge="start"*/}
            {/*                                                    onClick={() => setCategorySelectedDate(prev => prev.add(1, 'month'))}*/}
            {/*                                                    disabled={categorySelectedDate.add(1, 'month').isAfter(currentYear, 'month')}*/}
            {/*                                                    tabIndex={-1}*/}
            {/*                                                >*/}
            {/*                                                    <ChevronRightIcon fontSize="small"/>*/}
            {/*                                                </IconButton>*/}
            {/*                                            </InputAdornment>*/}
            {/*                                        ),*/}
            {/*                                    },*/}
            {/*                                },*/}
            {/*                            }}*/}
            {/*                        />*/}
            {/*                    </LocalizationProvider>*/}
            {/*                </Box>*/}
            {/*            </Box>*/}
            {/*            <Box*/}
            {/*                sx={{*/}
            {/*                    display: 'grid',*/}
            {/*                    gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'},*/}
            {/*                    gap: 2,*/}
            {/*                }}*/}
            {/*            >*/}
            {/*                {Object.values(categoriesExpenses).map((cat, i) => {*/}
            {/*                    const matchedCategory = categories.find(c => c.name === cat.category);*/}

            {/*                    return (*/}
            {/*                        <CategoryTransactionOverview*/}
            {/*                            key={i}*/}
            {/*                            categoryAmount={cat}*/}
            {/*                            color={matchedCategory?.color}*/}
            {/*                            // currency={user?.currency.symbol || ""}*/}
            {/*                            currency={"zł"}*/}
            {/*                        />*/}
            {/*                    );*/}
            {/*                })}*/}

            {/*            </Box>*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}
            {/*</Box>*/}

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
                                                fontWeight={"bold"}>{t('transactions.page.table.label')}</Typography>
                                    <Typography variant="body2"
                                                color={"text.secondary"}>{t('transactions.page.table.secondLabel')}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{my: 1}}/>
                            <DataGrid
                                rows={recurringTransactions}
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
                                    '& .MuiDataGrid-cell.pricePositive': {
                                        color: "green",
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
            <RecurringTransactionDialog
                open={editRecurringTransaction}
                onClose={() => {
                    setEditRecurringTransaction(false)
                    setSelectedTransaction(null)
                }}
                recurringTransaction={selectedRecurringTransaction}
                accounts={accounts}
                categories={categories}
            />
        </>
    );
}

export default TransactionPage;