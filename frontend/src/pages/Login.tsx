import {Button, Container, TextField, Typography, Paper} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useAuthStore} from '../store/auth';
import {useNavigate} from "react-router-dom";

function Login() {
    const login = useAuthStore((s) => s.login);
    const {register, handleSubmit, formState: {errors}} = useForm<{
        email: string;
        password: string;
    }>();
    const navigate = useNavigate();

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await login(data.email, data.password);
            navigate("/"); // 👈 Po zalogowaniu przekierowanie do dashboardu
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{p: 4, mt: 8}}>
                <Typography variant="h5" mb={2}>Logowanie</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        label="Hasło"
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
                        Zaloguj się
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Login