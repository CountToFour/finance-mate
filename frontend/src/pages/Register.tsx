import {Button, Container, TextField, Typography, Paper} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {useAuthStore} from '../store/auth';
import {useNavigate} from 'react-router-dom';
import axios from "axios";

type RegisterForm = {
    username: string;
    email: string;
    password: string;
};

function Register() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.register);
    const {register, handleSubmit, formState: {errors}, setError, clearErrors} = useForm<RegisterForm>();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data: RegisterForm) => {
        setSubmitting(true);
        try {
            await login(data.email, data.password, data.username);
            navigate("/");
        } catch (err) {
            console.log(err);
            const isAxios = axios.isAxiosError(err);
            const status = isAxios ? err.response?.status : undefined;
            if (status === 409) {
                setError('email', { type: 'server', message: 'Account with this email already exists.' });
            } else {
                setError('root', { type: 'server', message: 'Wystąpił błąd. Spróbuj ponownie.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{p: 4, mt: 8}}>
                <Typography variant="h5" mb={2}>Rejestracja</Typography>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <TextField
                        label="Nazwa użytkownika"
                        fullWidth
                        margin="normal"
                        {...register('username', { required: 'Podaj nazwę użytkownika' })}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        {...register('email', {
                            required: 'Podaj email' ,
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Podaj poprawny email'
                            },
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
                        {...register('password', { required: 'Podaj hasło' })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    {errors.root?.message && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'right'
                        }}>
                            {errors.root.message}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={submitting}
                        sx={{mt: 2}}
                    >
                        {submitting ? 'Zakładanie konta…' : 'Załóż konto'}
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        fullWidth
                        sx={{mt: 1}}
                        onClick={() => navigate('/login')}
                    >
                        Mam już konto – Zaloguj się
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Register