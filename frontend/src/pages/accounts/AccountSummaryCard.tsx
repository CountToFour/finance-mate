import React from "react";
import {Card, CardContent, Box, Typography, IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type {SxProps, Theme} from '@mui/material/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';

type AccountProps = {
    name: string
    description?: string
    currencySymbol: string
    balance: number
    color: string
    includeInStats: boolean
    statsMethod: () => void;
    deleteMethod: () => void;
    editMethod: () => void;
    sx?: SxProps<Theme>;
};

const AccountSummaryCard: React.FC<AccountProps> = ({
                                                        name,
                                                        description,
                                                        currencySymbol,
                                                        balance,
                                                        color,
                                                        includeInStats,
                                                        statsMethod,
                                                        deleteMethod,
                                                        editMethod,
                                                        sx
                                                    }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <Card
            elevation={1}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                background: `linear-gradient(to bottom right, ${hexToRgba(color, 0.2)}, #FFFFFF)`,
                border: '1px solid',
                borderColor: 'divider',
                ...sx,
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle1" fontWeight={"bold"} color={color}>
                        {name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <IconButton size="small"
                                    onClick={statsMethod}
                        >
                            {includeInStats && (
                                <LockOpenIcon sx={{color: 'green'}}/>
                            )}
                            {!includeInStats && (
                                <LockOutlineIcon sx={{color: 'red'}}/>
                            )}
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            sx={{
                                color: "grey.600",
                            }}
                        >
                            <MoreVertIcon/>
                        </IconButton>
                    </Box>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            editMethod();
                        }}>Edytuj</MenuItem>
                        <MenuItem onClick={deleteMethod}>Usuń</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Inne opcje</MenuItem>
                    </Menu>
                </Box>


                <Typography
                    variant="h5"
                    sx={{
                        marginTop: 4,
                        fontWeight: 600,
                    }}
                    color={color}
                >
                    {balance.toLocaleString(undefined, {minimumFractionDigits: 2})} {currencySymbol}
                </Typography>

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    {description && (
                        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                            {description}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default AccountSummaryCard;