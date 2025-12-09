import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton, Avatar, Button
} from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {useTranslation} from "react-i18next";

const drawerWidth = 240;

export function Layout() {
    const { t } = useTranslation();
    const logout = useAuthStore(s => s.logout);
    const user = useAuthStore(s => s.user);
    const name = user?.username || 'User';
    const navigate = useNavigate();

    const menuItems = [
        { text: t('layout.dashboard'), icon: <HomeIcon />, path: "/dashboard" },
        { text: t('layout.account'), icon: <AccountBalanceWalletIcon />, path: "/accounts" },
        { text: t('layout.expenses'), icon: <ReceiptIcon />, path: "/expenses" },
        { text: t('layout.incomes'), icon: <AttachMoneyIcon />, path: "/incomes" },
        { text: t('layout.budget'), icon: <CrisisAlertIcon />, path: "/budgets" },
        { text: t('layout.report'), icon: <BarChartIcon />, path: "/reports" },
        { text: t('layout.settings'), icon: <SettingsIcon />, path: "/settings" },
    ];

    const stringAvatar = (displayName: string) => {
        const trimmed = displayName.trim();
        const parts = trimmed.split(' ').filter(Boolean);
        const initials =
            parts.length >= 2
                ? `${parts[0][0]}${parts[1][0]}`
                : (trimmed.slice(0, 2) || '?').toUpperCase();

        return {
            sx: { bgcolor: 'secondary.main', width: 32, height: 32, fontSize: 14 },
            children: initials,
        };
    };

    return (
        <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
            {/* Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        bgcolor: "#EBE6CD",
                        borderRight: "1px solid #e0e0e0",
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <Toolbar>
                    <Typography variant="h6" color="secondary" sx={{ fontWeight: "bold" }}>
                        FinanceMate
                    </Typography>
                </Toolbar>
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton key={item.text} onClick={() => navigate(item.path)}>
                            <ListItemIcon sx={{ color: "secondary.main" }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    ))}
                </List>
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        onClick={() => { logout(); navigate('/login'); }}
                    >
                        {t('layout.logOut')}
                    </Button>
                </Box>

            </Drawer>

            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* AppBar */}
                <AppBar
                    position="fixed"
                    color="primary"
                    enableColorOnDark
                    sx={{ ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}
                >
                    <Toolbar sx={{ justifyContent: 'flex-end' }}>
                        <Avatar {...stringAvatar(name)} />
                        <Box sx={{ ml: 2, mr: 2 }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {user?.email}
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Content */}
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}