import React, {useMemo, useState, useEffect} from 'react'
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Box} from '@mui/material'
import type {Category, CategoryDto} from '../../lib/types'
import {createCategory, updateCategory} from '../../lib/api'
import {useNotification} from '../../components/NotificationContext'

type Props = {
    open: boolean
    onClose: () => void
    categories: Category[]
    transactionType: string
    onSaved: (cat: Category, edited?: boolean) => void
    editing?: Category | null
    parentForNew?: string | null
}

const flattenForSelect = (cats: Category[]) => {
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

    const out: { id: string|null, label: string }[] = [{id: null, label: 'Brak (kategoria główna)'}]
    const walk = (nodes: typeof roots, prefix = '') => {
        nodes.forEach(n => {
            out.push({id: n.id, label: prefix + n.name})
            if (n.children && n.children.length) walk(n.children, prefix + '— ')
        })
    }
    walk(roots)
    return out
}

const AddCategoryDialog: React.FC<Props> = ({open, onClose, categories, transactionType, onSaved, editing=null, parentForNew=null}) => {
    const [name, setName] = useState('')
    const [color, setColor] = useState('#1976d2')
    const [parentId, setParentId] = useState<string | null>(null)
    const {success, error} = useNotification()

    const options = useMemo(() => flattenForSelect(categories), [categories])

    const findParentColor = (id: string | null) => {
        if (!id) return undefined
        const found = categories.find(c => c.id === id)
        return found?.color
    }

    useEffect(() => {
        if (open) {
            if (editing) {
                setName(editing.name || '')
                setParentId(editing.parentId || null)
                // jeśli mamy parent, kolor będzie pobrany z rodzica
                const pcol = findParentColor(editing.parentId || null)
                setColor(pcol || editing.color || '#1976d2')
            } else if (parentForNew) {
                setName('')
                setParentId(parentForNew)
                const pcol = findParentColor(parentForNew)
                setColor(pcol || '#1976d2')
            } else {
                setName('')
                setColor('#1976d2')
                setParentId(null)
            }
        }
    }, [open, editing, parentForNew, categories])

    // kiedy użytkownik zmieni rodzica w select (dynamiczne ustawienie koloru i zablokowanie)
    useEffect(() => {
        if (parentId) {
            const pcol = findParentColor(parentId)
            if (pcol) setColor(pcol)
        }
    }, [parentId])

    const handleSubmit = async () => {
        if (!name.trim()) return error('Podaj nazwę kategorii')
        const dto: CategoryDto = { 
            name: name.trim(), 
            color, 
            parentId: parentId || undefined, 
            transactionType: transactionType 
        }
        try {
            if (editing) {
                const res = await updateCategory(dto, editing.id)
                onSaved(res.data, true)
                success('Kategoria zaktualizowana')
            } else {
                const res = await createCategory(dto)
                onSaved(res.data, false)
                success('Kategoria dodana')
            }
            setName('')
            setColor('#1976d2')
            setParentId(null)
            onClose()
        } catch (e) {
            console.error(e)
            error('Błąd podczas zapisu kategorii')
        }
    }

    const colorLocked = !!parentId

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editing ? 'Edytuj kategorię' : 'Dodaj kategorię'}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{mt:1}}>
                    <TextField label="Nazwa" value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <Box>
                        <TextField select label="Rodzic" value={parentId ?? ''} onChange={e => setParentId(e.target.value || null)} fullWidth>
                            {options.map(o => (
                                <MenuItem key={String(o.id)} value={o.id ?? ''}>{o.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField label="Kolor" type="color" value={color} onChange={e => setColor(e.target.value)} disabled={colorLocked} helperText={colorLocked ? 'Kolor dziedziczony od rodzica' : ''} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>{editing ? 'Zapisz zmiany' : 'Zapisz'}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddCategoryDialog
