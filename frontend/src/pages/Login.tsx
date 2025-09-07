import {Button, Container, TextField, Typography, Paper} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useAuthStore} from '../store/auth';
import {useNavigate} from "react-router-dom";
import axios from "axios";

function Login() {
    const login = useAuthStore((s) => s.login);
    const {register, handleSubmit, formState: {errors}, setError, clearErrors} = useForm<{
        email: string;
        password: string;
    }>();
    const navigate = useNavigate();

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await login(data.email, data.password);
            navigate("/"); // 👈 Po zalogowaniu przekierowanie do dashboardu
        } catch (err) {
            console.log(err);
            const isAxios = axios.isAxiosError(err);
            const status = isAxios ? err.response?.status : undefined;
            if (status === 400 || status === 403) {
                setError('root', { type: 'server', message: 'Bad credentials' });
                setError('email', { type: 'server', message: '' });
                setError('password', { type: 'server', message: '' });
            } else {
                setError('root', { type: 'server', message: 'Wystąpił błąd. Spróbuj ponownie.' });
            }
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
                        {...register('email', {
                            required: "Podaj email",
                            onChange: () => clearErrors(['root', 'email', 'password'])
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        label="Hasło"
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register('password', {
                            required: "Podaj hasło",
                            onChange: () => clearErrors(['root', 'email', 'password'])
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    {errors.root?.message && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'right'
                        }}>
                            {errors.root.message}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
                        Zaloguj się
                    </Button>
                </form>
                <Button
                    variant="text"
                    color="secondary"
                    fullWidth
                    sx={{mt: 1}}
                    onClick={() => navigate('/register')}
                >
                    Załóż konto
                </Button>

            </Paper>
        </Container>
    );
}

export default Login