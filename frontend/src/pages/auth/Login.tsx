import {Button, Container, TextField, Typography, Paper} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useAuthStore} from '../../store/auth-store.ts';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useTranslation} from "react-i18next";
import {authService} from "../../api/auth-client.ts";
import type {LoginRequest} from "../../types/auth.ts";

function Login() {
    const {register, handleSubmit, formState: {errors}, setError, clearErrors} = useForm<{
        email: string;
        password: string;
    }>();
    const navigate = useNavigate();
    const setUser = useAuthStore(state => state.setUser);
    const { t } = useTranslation();

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            const loginData: LoginRequest = {
                email: data.email,
                password: data.password
            }
            await authService.login(loginData);
            const response = await authService.getUser(data.email)
            setUser(response);
            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            const isAxios = axios.isAxiosError(err);
            const status = isAxios ? err.response?.status : undefined;
            if (status === 400 || status === 401) {
                setError('root', { type: 'server', message: t('logging.error.badCredentials') });
                setError('email', { type: 'server', message: '' });
                setError('password', { type: 'server', message: '' });
            } else {
                setError('root', { type: 'server', message: t('logging.error.error') });
            }
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{p: 4, mt: 8}}>
                <Typography variant="h5" mb={2}>{t('logging.form.label')}</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label={t('logging.form.email')}
                        fullWidth
                        margin="normal"
                        {...register('email', {
                            required: t('logging.error.email'),
                            onChange: () => clearErrors(['root', 'email', 'password'])
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        label={t('logging.form.password')}
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register('password', {
                            required: t('logging.error.password'),
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
                        {t('logging.form.logIn')}
                    </Button>
                </form>
                <Button
                    variant="text"
                    color="secondary"
                    fullWidth
                    sx={{mt: 1}}
                    onClick={() => navigate('/register')}
                >
                    {t('logging.form.createAccount')}
                </Button>

            </Paper>
        </Container>
    );
}

export default Login