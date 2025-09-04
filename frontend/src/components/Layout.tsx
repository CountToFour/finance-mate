import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton
} from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import {BarChart, Home, PieChart, Settings} from "lucide-react";

const drawerWidth = 240;

export function Layout() {
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    const menuItems = [
        { text: "Pulpit", icon: <Home />, path: "/" },
        { text: "Wydatki", icon: <BarChart />, path: "/" },
        { text: "Przychody", icon: <BarChart />, path: "/" },
        { text: "Budżet", icon: <PieChart />, path: "/" },
        { text: "Raporty", icon: <BarChart />, path: "/" },
        { text: "Ustawienia", icon: <Settings />, path: "/" },
    ];

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
                        bgcolor: "background.default",
                        borderRight: "1px solid #e0e0e0",
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
                        <Typography variant="h6" sx={{ mr: 2 }}>Finance</Typography>
                        <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
                            Wyloguj
                        </Button>
                    </Toolbar>
                </AppBar>

                {/* Content */}
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}