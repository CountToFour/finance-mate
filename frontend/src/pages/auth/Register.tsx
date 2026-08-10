import {Button, Container, TextField, Typography, Paper} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {useAuthStore} from '../../store/auth-store.ts';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import {useTranslation} from "react-i18next";
import type {UserRegistration} from "../../types/auth.ts";
import {authService} from "../../api/auth-client.ts";

function Register() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {register, handleSubmit, formState: {errors}, setError, clearErrors} = useForm<UserRegistration>({mode: "onSubmit", reValidateMode: "onSubmit"});
    const [submitting, setSubmitting] = useState(false);
    const setUser = useAuthStore(state => state.setUser);

    const onSubmit = async (data: UserRegistration) => {
        setSubmitting(true);
        try {
            await authService.register(data);
            const response = await authService.getUser(data.email);
            setUser(response);
            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            const isAxios = axios.isAxiosError(err);
            const status = isAxios ? err.response?.status : undefined;
            if (status === 409) {
                setError('email', { type: 'server', message: t('register.error.email.emailTaken') });
            } else {
                setError('root', { type: 'server', message: t('register.error.error') });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{p: 4, mt: 8}}>
                <Typography variant="h5" mb={2}>{t('register.form.label')}</Typography>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <TextField
                        label={t('register.form.firstName')}
                        fullWidth
                        margin="normal"
                        {...register('firstName', {
                            required: t('register.error.firstName.required'),
                            minLength: {
                                value: 2,
                                message: t('register.error.firstName.minLength')
                            },
                            maxLength: {
                                value: 50,
                                message: t('register.error.firstName.maxLength')
                            },
                            pattern: {
                                value: /^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\- ]+$/,
                                message: t('register.error.firstName.pattern')
                            }
                        })}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                    />
                    <TextField
                        label={t('register.form.lastName')}
                        fullWidth
                        margin="normal"
                        {...register('lastName', {
                            required: t('register.error.lastName.required'),
                            minLength: {
                                value: 2,
                                message: t('register.error.lastName.minLength')
                            },
                            maxLength: {
                                value: 50,
                                message: t('register.error.lastName.maxLength')
                            },
                            pattern: {
                                value: /^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\- ]+$/,
                                message: t('register.error.lastName.pattern')
                            }
                        })}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                    />
                    <TextField
                        label={t('logging.form.email')}
                        type="email"
                        fullWidth
                        margin="normal"
                        {...register('email', {
                            required: t('register.error.email.required'),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t('register.error.email.incorrectEmail')
                            },
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
                            required: t('register.error.password.required'),
                            minLength: {
                                value: 8,
                                message: t('register.error.password.minLength')
                            },
                            maxLength: {
                                value: 64,
                                message: t('register.error.password.maxLength')
                            },
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._#-])[A-Za-z\d@$!%*?&._#-]{8,64}$/,
                                message: t('register.error.password.pattern')
                            }
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
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={submitting}
                        sx={{mt: 2}}
                    >
                        {submitting ? t('register.form.creatingAccount') : t('register.form.createAccount')}
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        fullWidth
                        sx={{mt: 1}}
                        onClick={() => navigate('/login')}
                    >
                        {t('register.form.logIn')}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Register