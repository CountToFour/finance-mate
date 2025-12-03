import React, {useEffect, useState} from 'react'
import {Box, Button, Card, CardContent, Stack, Typography, Divider, ToggleButton, ToggleButtonGroup} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {getCategories, deleteCategory} from '../../lib/api'
import type {Category} from '../../lib/types'
import CategoryTree from './CategoryTree'
import AddCategoryDialog from './AddCategoryDialog'
import {useNotification} from '../../components/NotificationContext'

const SettingsPage: React.FC = () => {
    const [view, setView] = useState<'CATEGORIES' | 'GENERAL'>('CATEGORIES')
    const [transactionType, setTransactionType] = useState<string>('EXPENSE')
    const [categories, setCategories] = useState<Category[]>([])
    const [openAdd, setOpenAdd] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [parentForNew, setParentForNew] = useState<string | null>(null)
    const {success, error: notifyError} = useNotification()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getCategories(transactionType)
                setCategories(res.data)
            } catch (err) {
                console.error(err)
            }
        }
        load()
    }, [transactionType])

    const handleSaved = () => {
        // reload categories after creation
        getCategories(transactionType).then(res => setCategories(res.data)).catch(console.error)
        success('Kategoria dodana')
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id)
            success('Usunięto kategorię')
            getCategories(transactionType).then(res => setCategories(res.data)).catch(console.error)
        } catch (err) {
            console.error(err)
            notifyError('Błąd podczas usuwania')
        }
    }

    const handleEdit = (cat: Category) => {
        setEditing(cat)
        setParentForNew(null)
        setOpenAdd(true)
    }

    const handleAdd = (parentId: string | null) => {
        setEditing(null)
        setParentForNew(parentId)
        setOpenAdd(true)
    }

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Ustawienia</Typography>
                    <Typography variant="body2" sx={{mt:1}}>Zarządzaj kategoriami i preferencjami aplikacji</Typography>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                    <Box sx={{display: 'flex', bgcolor: '#f3f4f6', borderRadius: '999px', p: '4px'}}>
                        <Button onClick={() => setView('CATEGORIES')} variant={view==='CATEGORIES' ? 'contained' : 'text'} color={view==='CATEGORIES' ? 'secondary' : 'primary'} sx={{borderRadius: '999px', px:3}}>Kategorie</Button>
                        <Button onClick={() => setView('GENERAL')} variant={view==='GENERAL' ? 'contained' : 'text'} color={view==='GENERAL' ? 'secondary' : 'primary'} sx={{borderRadius: '999px', px:3}}>Ogólne</Button>
                    </Box>
                </Box>
            </Stack>

            {view === 'CATEGORIES' && (
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={700} mb={1}>Kategorie ({transactionType === 'EXPENSE' ? 'Wydatki' : 'Przychody'})</Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>Kategorie — Przeglądaj i dodawaj nowe podkategorie</Typography>

                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <ToggleButtonGroup
                                    value={transactionType}
                                    exclusive
                                    onChange={(_, val) => { if (val) setTransactionType(val) }}
                                    size="small"
                                >
                                    <ToggleButton value={'EXPENSE'}>Wydatki</ToggleButton>
                                    <ToggleButton value={'INCOME'}>Przychody</ToggleButton>
                                </ToggleButtonGroup>
                                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleAdd(null)}>Nowa kategoria</Button>
                            </Box>
                        </Box>
                        <Divider sx={{mb:2}} />
                        <CategoryTree categories={categories} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
                    </CardContent>
                </Card>
            )}

            {view === 'GENERAL' && (
                <Card>
                    <CardContent>
                        <Typography variant="h6">Ustawienia ogólne</Typography>
                        <Typography variant="body2" color="text.secondary">Tutaj pojawią się ustawienia globalne aplikacji.</Typography>
                    </CardContent>
                </Card>
            )}

            <AddCategoryDialog
                open={openAdd}
                onClose={() => { setOpenAdd(false); setEditing(null); setParentForNew(null) }}
                categories={categories}
                transactionType={transactionType}
                onSaved={() => { setOpenAdd(false); handleSaved() }}
                editing={editing}
                parentForNew={parentForNew}
            />
        </Box>
    )
}

export default SettingsPage
