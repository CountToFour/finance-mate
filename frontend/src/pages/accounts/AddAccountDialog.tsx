import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem, Box, IconButton, Typography, ClickAwayListener,
} from "@mui/material";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {Account, CreateAccountDto, Currency} from "../../lib/types.ts";
import {
    getCurrencies,
    createAccount, updateAccount
} from "../../lib/api.ts";
import {useTranslation} from "react-i18next";
import {ChromePicker, CirclePicker} from 'react-color';
import AddIcon from "@mui/icons-material/Add";

const defaultColor = [ "#4CAF50", "#2196F3", "#FFC107", "#F44336",
    "#9C27B0", "#FF9800", "#607D8B", "#E91E63"
]

interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    initialAccount?: Account | null;
}

const AddAccountDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, initialAccount}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [color, setColor] = useState<string>("#2b8aef");
    const [currencyCode, setCurrencyCode] = useState<string>("");
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [customColor, setCustomColor] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    const [errors, setFormErrors] = useState<{amount:string;color:string;currencyId:string;name:string;description:string}>({
        amount: "",
        color: "",
        currencyId: "",
        name: "",
        description: "",
    });

    useEffect(() => {
        if (!showPicker) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowPicker(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showPicker]);

    useEffect(() => {
        void getCurrencies().then((res) => setCurrencies(res.data)).catch(() => {
        });
        if (initialAccount) {
            setName(initialAccount.name ?? "");
            setDescription(initialAccount.description ?? "");
            setAmount((initialAccount.balance ?? 0).toString());
            setColor(initialAccount.color ?? '#2b8aef')
            setCurrencyCode(initialAccount.currency.code ?? "");
        } else {
            setName("");
            setDescription("");
            setAmount("");
            setColor('#2b8aef');
            setCurrencyCode("");
        }
    }, [initialAccount]);


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", color: "", currencyId: "", name: ""};

        if (!amount || Number.isNaN(parseFloat(amount))) {
            newErrors.amount = t('accounts.add.amountRequired', 'Saldo jest wymagane');
            valid = false;
        }
        if (!color) {
            newErrors.color = 'Kolor jest wymagany'
            valid = false;
        }
        if (!currencyCode) {
            newErrors.currencyId = 'Waluta jest wymagana'
            valid = false;
        }
        if (!name) {
            newErrors.name = 'Nazwa jest wymagana'
            valid = false;
        }

        setFormErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) return;
        console.log("waluta " + currencyCode)
        const accountDto = ({
            name: name,
            description: description || undefined,
            currencyCode: currencyCode,
            balance: parseFloat(amount) || 0,
            color: color,
        } as unknown) as CreateAccountDto;

        console.log(accountDto);
        try {
            if (!initialAccount) {
                await createAccount(accountDto);
                success(t('accounts.notifications.createSuccess', 'Udało się utworzyć konto'));
                handleClose();
            } else {
                await updateAccount(accountDto, initialAccount.id);
                success(t('accounts.notifications.updateSuccess', 'Udało się zaktualizować konto'));
                handleClose();
            }
        } catch (e) {
            console.error(e);
            if (!initialAccount) {
                error(t('accounts.notifications.createError', 'Nie udało się utworzyć konta'));
            } else {
                error(t('accounts.notifications.updateError', 'Nie udało się zaktualizować konta'));
            }
        }

    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setAmount("");
        setColor('#2b8aef');
        setCurrencyCode("");
        setShowPicker(false);
        setFormErrors({amount: "", color: "", currencyId: "", name: "", description: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {initialAccount
                    ? t('accounts.dialog.editTitle', 'Edytuj konto')
                    : t('accounts.dialog.addTitle', 'Dodaj konto')}
            </DialogTitle>

            <DialogContent dividers sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        label={t('accounts.fields.amount', 'Saldo')}
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (e.target.value.length > 0) {
                                setFormErrors((prev) => ({...prev, amount: ""}));
                            }
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount}
                    />
                    <TextField
                        select
                        fullWidth
                        label={t('accounts.fields.currency', 'Waluta')}
                        value={currencyCode}
                        onChange={(e) => {
                            setCurrencyCode(e.target.value);
                            setFormErrors((prev) => ({...prev, currencyId: ""}));
                        }}
                        error={!!errors.currencyId}
                        helperText={errors.currencyId}
                    >
                        {currencies.map((currency: Currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                                {currency.code} {currency.symbol ? `- ${currency.symbol}` : ''}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <TextField
                    fullWidth
                    label={t('accounts.fields.name', 'Nazwa')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                />

                <TextField
                    sx={{mb: 2}}
                    fullWidth
                    margin="normal"
                    label={t('accounts.fields.description', 'Opis')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Box sx={{width: '100%'}}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        {t('accounts.fields.color', 'Kolor')}
                    </Typography>

                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            "& .circle-picker": {
                                width: "auto !important",
                                display: "flex !important",
                                flexWrap: "wrap !important"
                            },
                        }}
                    >
                            <CirclePicker
                                circleSize={30}
                                circleSpacing={8}
                                color={color}
                                onChangeComplete={(color) => setColor(color.hex)}
                                colors={defaultColor}
                            />

                        <IconButton
                            onClick={() => setShowPicker(!showPicker)}
                            sx={{
                                ml: 1,
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: customColor,
                                border: "2px dashed #aaa",
                                transition: "transform 0.2s",
                                "&:hover": {
                                    transform: "scale(1.2)",
                                    background: customColor,
                                },
                            }}
                        >
                            <AddIcon sx={{ color: "#aaa" }} />
                        </IconButton>

                        {showPicker && (
                            <ClickAwayListener onClickAway={() => setShowPicker(false)}>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 1400,
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        backgroundColor: 'background.paper',
                                        p: 1,
                                    }}
                                >
                                    <ChromePicker
                                        color={customColor}
                                        onChange={(color) => {
                                            setCustomColor(color.hex);
                                            setColor(color.hex);
                                        }}
                                    />
                                </Box>
                            </ClickAwayListener>
                            )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">
                    {t('expenses.addExpense.cancel', 'Anuluj')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('expenses.addExpense.save', 'Zapisz')}
                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default AddAccountDialog;
