import {Button, Container, TextField, Typography, Paper, Alert} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {useAuthStore} from '../store/auth';
import {useNavigate} from 'react-router-dom';

type RegisterForm = {
    username: string;
    email: string;
    password: string;
};

function Register() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.register);
    const {register, handleSubmit, formState: {errors}} = useForm<RegisterForm>();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: RegisterForm) => {
        setSubmitting(true);
        setError(null);
        try {
            await login(data.email, data.password, data.username);
            navigate("/");
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{p: 4, mt: 8}}>
                <Typography variant="h5" mb={2}>Rejestracja</Typography>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <form onSubmit={handleSubmit(onSubmit)}>
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
                        {...register('email', { required: 'Podaj email' })}
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