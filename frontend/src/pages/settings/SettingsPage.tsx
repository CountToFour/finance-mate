import React, {useEffect, useState} from 'react'
import {Box, Button, Card, CardContent, Stack, Typography, ButtonGroup} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {getCategories} from '../../lib/api'
import type {Category, CategoryDto} from '../../lib/types'
import CategoryTree from './CategoryTree'
import AddCategoryDialog from './AddCategoryDialog'
import {useNotification} from '../../components/NotificationContext'

const SettingsPage: React.FC = () => {
    const [transactionType, setTransactionType] = useState<string>('EXPENSE')
    const [categories, setCategories] = useState<Category[]>([])
    const [openAdd, setOpenAdd] = useState(false)
    const {success, error} = useNotification()

    const load = async (type = transactionType) => {
        try {
            const res = await getCategories(type)
            setCategories(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => { load(transactionType) }, [transactionType])

    const handleSaved = (saved: Category) => {
        // reload categories after creation
        load()
        success('Kategoria dodana')
    }

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Ustawienia</Typography>
                    <Typography variant="body2" sx={{mt:1}}>Zarządzaj kategoriami i innymi ustawieniami aplikacji</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <ButtonGroup variant="outlined">
                        <Button onClick={() => setTransactionType('EXPENSE')} color={transactionType==='EXPENSE' ? 'secondary' : 'primary'}>Wydatki</Button>
                        <Button onClick={() => setTransactionType('INCOME')} color={transactionType==='INCOME' ? 'secondary' : 'primary'}>Przychody</Button>
                    </ButtonGroup>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>Dodaj kategorię</Button>
                </Stack>
            </Stack>

            <Card variant="outlined" sx={{p:2, borderRadius:2}}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={1}>Kategorie ({transactionType === 'EXPENSE' ? 'Wydatki' : 'Przychody'})</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>Istniejące kategorie — możesz je przeglądać i dodawać nowe podkategorie</Typography>

                    <CategoryTree categories={categories} />
                </CardContent>
            </Card>

            <AddCategoryDialog
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                categories={categories}
                transactionType={transactionType}
                onSaved={handleSaved}
            />
        </Box>
    )
}

export default SettingsPage
