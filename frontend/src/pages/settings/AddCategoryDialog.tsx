import React, {useMemo, useState, useEffect, useCallback} from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Box,
    FormControl, InputLabel, Select
} from '@mui/material'
import {useNotification} from '../../components/NotificationContext'
import type {Category, CategoryDto, CategoryGroup, SubCategoryDto, TransactionType} from "../../types/category.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {categoryService} from "../../api/category-client.ts";
import {useTranslation} from "react-i18next";
import type {TFunction} from "i18next";

type Props = {
    open: boolean
    onClose: () => void
    categories: Category[]
    transactionType: TransactionType
    editing?: Category | null
    parentForNew?: string | null
}

const flattenForSelect = (cats: Category[], t: TFunction) => {
    const map = new Map<string, Category & { children?: Category[] }>()
    cats.forEach(c => map.set(c.id, {...c, children: []}))
    const roots: Array<Category & { children?: Category[] }> = []
    map.forEach(node => {
        if (node.parentId) {
            const parent = map.get(node.parentId)
            if (parent) parent.children!.push(node)
            else roots.push(node)
        } else roots.push(node)
    })

    const out: { id: string|null, label: string }[] = [{id: null, label: t('settings.page.categories.add.main')}]
    const walk = (nodes: typeof roots, prefix = '') => {
        nodes.forEach(n => {
            out.push({id: n.id, label: prefix + n.name})
            if (n.children && n.children.length) walk(n.children, prefix + '— ')
        })
    }
    walk(roots)
    return out
}

const AddCategoryDialog: React.FC<Props> = ({open, onClose, categories, transactionType, editing=null, parentForNew=null}) => {
    const [name, setName] = useState('')
    const [color, setColor] = useState('#1976d2')
    const [parentId, setParentId] = useState<string | null>(null)
    const [group, setGroup] = useState<CategoryGroup | ''>('')
    const {success, error} = useNotification()
    const {t} = useTranslation()

    const addCategory = useCategoryStore(state => state.addCategory)
    const editCategory = useCategoryStore(state => state.updateCategory)

    const options = useMemo(() => flattenForSelect(categories, t), [categories])

    const findParentColor = useCallback((id: string | null) => {
        if (!id) return undefined
        const found = categories.find(c => c.id === id)
        return found?.color
    }, [categories])

    useEffect(() => {
        if (open) {
            if (editing) {
                setName(editing.name || '')
                setParentId(editing.parentId || null)
                setGroup(editing.categoryGroup || '')
                const pcol = findParentColor(editing.parentId || null)
                setColor(pcol || editing.color || '#1976d2')
            } else if (parentForNew) {
                setName('')
                setParentId(parentForNew)
                const pcol = findParentColor(parentForNew)
                setColor(pcol || '#1976d2')
                setGroup('')
            } else {
                setName('')
                setColor('#1976d2')
                setParentId(null)
                setGroup('')
            }
        }
    }, [open, editing, parentForNew, categories, findParentColor])

    useEffect(() => {
        if (parentId) {
            const pcol = findParentColor(parentId)
            if (pcol) setColor(pcol)
        }
    }, [findParentColor, parentId])

    const handleMainCategorySave = async() => {
        if (!name.trim()) {
            return error(t('settings.page.categories.add.error.name'))
        } else if (!group.trim() && transactionType === 'EXPENSE') {
            return error(t('settings.page.categories.add.error.group'))
        }
        const dto: CategoryDto = {
            name: name.trim(),
            color,
            transactionType: transactionType,
            categoryGroup: (transactionType === 'EXPENSE' && group) ? (group as CategoryGroup) : undefined
        }
        try {
            if (editing) {
                const res = await categoryService.updateCategory(dto, editing.id)
                editCategory(res)
                success(t('settings.page.categories.edit.success'))
            } else {
                const res = await categoryService.createCategory(dto)
                addCategory(res)
                success(t('settings.page.categories.add.success'))
            }
            setName('')
            setColor('#1976d2')
            setParentId(null)
            setGroup('')
            onClose()
        } catch (e) {
            console.error(e)
            error(t('settings.page.categories.add.error.message'))
        }
    }

    const handleSubCategorySave = async() => {
        if (!name.trim()) {
            return error(t('settings.page.categories.add.error.name'))
        }

        const dto: SubCategoryDto = {
            name: name.trim(),
            parentId: parentId,
        }
        try {
            const res = await categoryService.createSubCategory(dto)
            console.log(res)
            addCategory(res)
            success(t('settings.page.categories.add.success'))
            setName('')
            setColor('#1976d2')
            setParentId(null)
            setGroup('')
            onClose()
        } catch {
            error(t('settings.page.categories.add.error.message'))
        }
    }

    const handleSubmit = async () => {
        if (parentId) {
            await handleSubCategorySave()
        } else {
            await handleMainCategorySave()
        }

    }

    const colorLocked = !!parentId

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {editing ? t('settings.page.categories.edit.label') : t('settings.page.categories.add.label')}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{mt:1}}>
                    <TextField label={t('settings.page.categories.add.name')} value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <Box>
                        <TextField select label={t('settings.page.categories.add.parent')} value={parentId ?? ''} onChange={e => setParentId(e.target.value || null)} fullWidth>
                            {options.map(o => (
                                <MenuItem key={String(o.id)} value={o.id ?? ''}>{o.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {transactionType === 'EXPENSE' && (
                        <FormControl fullWidth>
                            <InputLabel>{t('settings.page.categories.add.group.label')}</InputLabel>
                            <Select
                                value={group}
                                label={t('settings.page.categories.add.group.label')}
                                onChange={(e) => setGroup(e.target.value as CategoryGroup)}
                            >
                                <MenuItem value="NEEDS">{t('settings.page.categories.add.group.needs')}</MenuItem>
                                <MenuItem value="WANTS">{t('settings.page.categories.add.group.wants')}</MenuItem>
                                <MenuItem value="SAVINGS">{t('settings.page.categories.add.group.savings')}</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <TextField label={t('settings.page.categories.add.color.label')} type="color" value={color} onChange={e => setColor(e.target.value)} disabled={colorLocked} helperText={colorLocked ? t('settings.page.categories.add.color.inherited') : ''} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={onClose}>{t('settings.page.categories.add.cancel')}</Button>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>{t('settings.page.categories.add.save')}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddCategoryDialog
