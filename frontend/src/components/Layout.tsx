import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';


export function Layout() {
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Finance</Typography>
                    <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>Wyloguj</Button>
                </Toolbar>
            </AppBar>
            <Outlet />
        </>
    );
}
