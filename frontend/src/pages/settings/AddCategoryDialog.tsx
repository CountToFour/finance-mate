import React, {useMemo, useState} from 'react'
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Box} from '@mui/material'
import type {Category, CategoryDto} from '../../lib/types'
import {createCategory} from '../../lib/api'
import {useNotification} from '../../components/NotificationContext'

type Props = {
    open: boolean
    onClose: () => void
    categories: Category[]
    transactionType: string
    onSaved: (cat: Category) => void
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

const AddCategoryDialog: React.FC<Props> = ({open, onClose, categories, transactionType, onSaved}) => {
    const [name, setName] = useState('')
    const [color, setColor] = useState('#1976d2')
    const [parentId, setParentId] = useState<string | null>(null)
    const {success, error} = useNotification()

    const options = useMemo(() => flattenForSelect(categories), [categories])

    const handleSubmit = async () => {
        if (!name.trim()) return error('Podaj nazwę kategorii')
        const dto: CategoryDto = { name: name.trim(), color, parentId: parentId || undefined, TransactionType: transactionType }
        try {
            const res = await createCategory(dto)
            onSaved(res.data)
            setName('')
            setColor('#1976d2')
            setParentId(null)
            onClose()
        } catch (e) {
            console.error(e)
            error('Błąd podczas tworzenia kategorii')
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Dodaj kategorię</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{mt:1}}>
                    <TextField label="Nazwa" value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <Box>
                        <TextField select label="Rodzic" value={parentId ?? ''} onChange={e => setParentId(e.target.value || null)} fullWidth>
                            {options.map(o => (
                                <MenuItem key={String(o.id)} value={o.id ?? ''}>{o.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField label="Kolor" type="color" value={color} onChange={e => setColor(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Anuluj</Button>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>Zapisz</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddCategoryDialog
