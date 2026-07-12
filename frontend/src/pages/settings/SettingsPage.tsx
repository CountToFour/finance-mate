import React, {useEffect, useState} from 'react'
import {Box, Button, Card, CardContent, Stack, Typography, Divider, ToggleButton, ToggleButtonGroup} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CategoryTree from './CategoryTree'
import AddCategoryDialog from './AddCategoryDialog'
import GeneralSettings from './GeneralSettings'
import type {Category, TransactionType} from "../../types/category.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {useTranslation} from "react-i18next";

const SettingsPage: React.FC = () => {
    const [view, setView] = useState<'CATEGORIES' | 'GENERAL'>('CATEGORIES')
    const [transactionType, setTransactionType] = useState<TransactionType>('EXPENSE')

    const categories = useCategoryStore(state => state.categories)

    const [openAdd, setOpenAdd] = useState(false)
    const [displayCategories, setDisplayCategories] = useState<Category[]>(categories.filter(c => c.transactionType === transactionType))
    const [editing, setEditing] = useState<Category | null>(null)
    const [parentForNew, setParentForNew] = useState<string | null>(null)

    const {t} = useTranslation()

    useEffect(() => {
        setDisplayCategories(categories.filter(c => c.transactionType === transactionType))
    }, [categories, transactionType]);

    const handleEdit = (category: Category) => {
        setEditing(category)
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
                    <Typography variant="h5" fontWeight={700}>
                        {t('settings.page.label')}
                    </Typography>
                    <Typography variant="body2" sx={{mt:1}}>
                        {t('settings.page.secondLabel')}
                    </Typography>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                    <Box sx={{display: 'flex', bgcolor: '#f3f4f6', borderRadius: '999px', p: '4px'}}>
                        <Button onClick={() => setView('CATEGORIES')} variant={view==='CATEGORIES' ? 'contained' : 'text'} color={view==='CATEGORIES' ? 'secondary' : 'primary'} sx={{borderRadius: '999px', px:3}}>
                            {t('settings.page.categories.buttonLabel')}
                        </Button>
                        <Button onClick={() => setView('GENERAL')} variant={view==='GENERAL' ? 'contained' : 'text'} color={view==='GENERAL' ? 'secondary' : 'primary'} sx={{borderRadius: '999px', px:3}}>
                            {t('settings.page.general.buttonLabel')}
                        </Button>
                    </Box>
                </Box>
            </Stack>

            {view === 'CATEGORIES' && (
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={700} mb={1}>
                                    {t('settings.page.categories.label')} - {transactionType === 'EXPENSE' ? t('settings.page.categories.expenses') : t('settings.page.categories.incomes')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    {t('settings.page.categories.secondLabel')}
                                </Typography>

                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <ToggleButtonGroup
                                    value={transactionType}
                                    exclusive
                                    onChange={(_, val) => { if (val) setTransactionType(val) }}
                                    size="small"
                                >
                                    <ToggleButton value={'EXPENSE'}>
                                        {t('settings.page.categories.expenses')}
                                    </ToggleButton>
                                    <ToggleButton value={'INCOME'}>
                                        {t('settings.page.categories.incomes')}
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleAdd(null)}>
                                    {t('settings.page.categories.add.label')}
                                </Button>
                            </Box>
                        </Box>
                        <Divider sx={{mb:2}} />
                        <CategoryTree categories={displayCategories} onAdd={handleAdd} onEdit={handleEdit} />
                    </CardContent>
                </Card>
            )}

            {view === 'GENERAL' && (
                <GeneralSettings />
            )}

            <AddCategoryDialog
                open={openAdd}
                onClose={() => { setOpenAdd(false); setEditing(null); setParentForNew(null) }}
                categories={displayCategories}
                transactionType={transactionType}
                editing={editing}
                parentForNew={parentForNew}
            />
        </Box>
    )
}

export default SettingsPage
