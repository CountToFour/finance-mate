import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    Button,
    MenuItem,
    TextField,
    IconButton,
    Chip,
    FormControlLabel,
    Switch,
    InputAdornment
} from "@mui/material";
import {Add, AttachMoneyOutlined} from '@mui/icons-material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import AddIncomeDialog from "./AddIncomeDialog";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import dayjs from "dayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {useTranslation} from "react-i18next";
import CategoryIncome from "./CategoryIncome";
import IncomeSummaryCard from "./IncomeSummaryCard";

import {
    getTransactions,
    getAllCategoriesAmount,
    getAccounts,
    getCategories,
    deleteRecurringTransaction, getAllRecurringExpenses, getAllRecurringTransactions,
    deleteTransaction,
    deactivateRecurringTransaction,
    getExpenseOverview
} from "../../lib/api";
import type {Account, Category, CategoryAmount, ExpenseOverview, Income, RecurringIncome} from "../../lib/types";
import Tooltip from "@mui/material/Tooltip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import {useNotification} from "../../components/NotificationContext.tsx";
import RecurringIncomeDialog from "./RecurringIncomeDialog.tsx";
import {ReceiptIcon, TrendingUpIcon } from "lucide-react";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const currentYear = dayjs();

function IncomePage() {
    const {t} = useTranslation();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Income[]>([]);
    const [categories, setCategories] = useState<Category[]>([])
    const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>([])
    const [selectedTransaction, setSelectedTransaction] = useState<Income | null>(null);
    const [selectedRecurringIncome, setSelectedRecurringIncome] = useState<RecurringIncome | null>(null)
    const [filteredCategory, setFilteredCategory] = useState<string>("Wszystkie");
    const [categoriesIncome, setCategoriesIncome] = useState<CategoryAmount[]>([]);
    const [overview, setOverview] = useState<ExpenseOverview>();
    

    const {success, error} = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [editRecurringIncome, setEditRecurringIncome] = useState(false);

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    const [categorySelectedDate, setCategorySelectedDate] = useState(dayjs());
    const categoryDateFrom = categorySelectedDate.startOf("month").format("YYYY-MM-DD");
    const categoryDateTo = categorySelectedDate.endOf("month").format("YYYY-MM-DD");

    const paginationModel = {page: 0, pageSize: 5};

    useEffect(() => {
        // fetch transactions for INCOME
        if (filteredCategory === "Wszystkie") {
            getTransactions('INCOME', null, dateFrom, dateTo).then((res) => setTransactions(res.data));
        } else {
            getTransactions('INCOME', filteredCategory, dateFrom, dateTo).then((res) => setTransactions(res.data));
        }
        getExpenseOverview('INCOME', null, null).then((res) => setOverview(res.data));
        
        getAccounts().then((res) => setAccounts(res.data));
        getCategories('INCOME').then((res) => setCategories(res.data));
    }, [openDialog, filteredCategory, dateFrom, dateTo]);

    useEffect(() => {
        getAllCategoriesAmount('INCOME', categoryDateFrom, categoryDateTo).then((res) => setCategoriesIncome(res.data));
    }, [openDialog, categoryDateFrom, categoryDateTo])

    useEffect(() => {
            getAllRecurringTransactions("INCOME").then((res) => setRecurringIncomes(res.data));
        }, [editRecurringIncome, openDialog])

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const handleRecurringDeletion = (id: string) => {
        deleteRecurringTransaction(id)
            .then(() => {
                success(t('expenses.notifications.delete.success'))
                getAllRecurringTransactions("INCOME").then((res) => setRecurringIncomes(res.data));
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    }

    const handleDeletion = (id: string) => {
        deleteTransaction(id)
            .then(() => {
                success(t('expenses.notifications.delete.success'))
                if (filteredCategory === "Wszystkie") {
                    getTransactions('INCOME', null, dateFrom, dateTo).then((res) => setTransactions(res.data));
                } else {
                    getTransactions('INCOME', filteredCategory, dateFrom, dateTo).then((res) => setTransactions(res.data));
                }
            })
            .catch(() => {
                error(t('expenses.notifications.delete.error'))
            });
    };

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
            headerName: t('income.page.table.date') || 'Data',
            flex: 1
        },
        {
            field: 'description',
            headerName: t('income.page.table.description') || 'Opis',
            flex: 2,
            valueFormatter: value => value ?? '-'
        },
        {
            field: 'category',
            headerName: t('income.page.table.category') || 'Kategoria',
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
            headerName: t('income.page.table.amount') || 'Kwota',
            flex: 0.8,
            valueFormatter: value => `+${value} zł`,
            cellClassName: 'pricePositive',
        },
        {
            field: 'actions',
            headerName: t('income.page.table.actions') || 'Akcje',
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
                                setSelectedTransaction(params.row as Income)
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
        }
    ];

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
                                            await deactivateRecurringTransaction(params.row.id);
    
                                            setRecurringIncomes(prev =>
                                                prev.map(exp =>
                                                    exp.id === params.row.id
                                                        ? { ...exp, active: !exp.active }
                                                        : exp
                                                )
                                            );
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
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
                valueFormatter: value => `+${value} zł`,
                cellClassName: 'pricePositive',
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
                                    setSelectedRecurringIncome(params.row as RecurringIncome)
                                    setEditRecurringIncome(true);
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
                                color={"secondary"}>{t('income.page.label') || 'Przychody'}</Typography>
                    <Typography variant="body2"
                                sx={{mt: 1}}>{t('income.page.secondLabel') || 'Zarządzaj przychodami'}</Typography>
                </Box>
                <Button variant={'contained'} color={'secondary'} onClick={() => setOpenDialog(true)}>
                    <Add sx={{mr: 1}}/>
                    {t('income.page.add') || 'Nowy przychód'}
                </Button>
            </Box>

            {/* Summary */}
            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <IncomeSummaryCard 
                    type="totalIncomes"
                    title="Całkowite przychody"
                    description=" względem poprzedniego miesiąca"
                    amount={overview?.totalAmount}
                    change={overview?.totalAmountChangePercentage}
                    currency="zł"
                    accentColor="green"
                    icon={<AttachMoneyOutlined fontSize="medium"/>}
                
                />
                <IncomeSummaryCard 
                    type="totalTransactions"
                    title="Transakcje"
                    description=" transakcji w tym miesiącu"
                    amount={overview?.expenseCount}
                    change={overview?.expenseCountChangePercentage}
                    accentColor="#70B2B1"
                    icon={<ReceiptIcon fontSize="medium"/>}
                    />
                <IncomeSummaryCard 
                    type="Average"
                    title="Średnia dzienna"
                    description="na podstawie 30 dni"
                    amount={overview?.averageAmount}
                    currency="zł"
                    accentColor="#5C86D3"
                    icon={<TrendingUpIcon fontSize="medium"/>}
                
                    />
            </Box>

            {/* Transactions table */}
            <Box ml={2} mr={2}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={"bold"}>Transakcje</Typography>
                                <Typography variant="body2" color={"text.secondary"}>Lista przychodów</Typography>
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
                                        }}                                    />
                                </LocalizationProvider>
                                <TextField value={filteredCategory} defaultValue={"Wszystkie"}
                                           onChange={(e) => setFilteredCategory(e.target.value)} select
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
                                        <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>))}
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
                                '& .MuiDataGrid-cell.pricePositive': {
                                    color: 'green',
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>

            {/* Categories */}
            <Box p={2}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={"bold"}>Przychody wg kategorii</Typography>
                                <Typography variant="body2" color={"text.secondary"}>Podział przychodów</Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker value={categorySelectedDate} yearsOrder="desc" maxDate={currentYear}
                                                onMonthChange={(newMonth) => {
                                                    setCategorySelectedDate(dayjs(newMonth));
                                                }} views={['month', 'year']} format={"MMMM YYYY"}
                                                slotProps={{textField: {size: 'small', sx: {width: 250}}}}/>
                                </LocalizationProvider>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'},
                            gap: 2
                        }}>
                            {Object.values(categoriesIncome).map((cat, i) => {
                                const matchedCategory = categories.find(c => c.name === cat.category);

                                return (
                                    <CategoryIncome
                                        key={i}
                                        categoryAmount={cat}
                                        color={matchedCategory?.color}
                                    />
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* RECURRING INCOMES TABLE */}
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
                                rows={recurringIncomes}
                                columns={recurringColumns}
                                initialState={{pagination: {paginationModel}}}
                                pageSizeOptions={[5, 10]}
                                disableColumnMenu={true}
                                disableColumnResize={true}
                                disableRowSelectionOnClick={true}
                                sx={{
                                    border: 0, width: '100%', backgroundColor: 'transparent',
                                    '& .MuiDataGrid-cell.pricePositive': {
                                        color: 'green',
                                        fontWeight: 500,
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <AddIncomeDialog 
                open={openDialog} 
                onClose={() => {
                    setOpenDialog(false)
                    setSelectedTransaction(null)
                }}
                initialTransaction={selectedTransaction} 
                accounts={accounts} 
                categories={categories}
            />
            <RecurringIncomeDialog
                open={editRecurringIncome}
                onClose={() => 
                    setEditRecurringIncome(false)
                }
                recurringTransaction={selectedRecurringIncome}
                accounts={accounts}
                categories={categories}
                />
        </>
    )
}

export default IncomePage;
