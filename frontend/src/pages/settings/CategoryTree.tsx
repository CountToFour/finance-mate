import React, {useState, Fragment} from 'react'
import type {Category} from '../../lib/types'
import {Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Collapse, Typography, Tooltip} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { deleteCategory } from '../../lib/api'
import {useNotification} from "../../components/NotificationContext.tsx";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

type Props = {
    categories: Category[]
    onAdd?: (parentId: string | null) => void
    onEdit?: (cat: Category) => void
    onDelete?: (id: string) => void
}

type Node = Category & { children?: Node[] }

const buildTree = (cats: Category[]): Node[] => {
    const map = new Map<string, Node>()
    cats.forEach(c => map.set(c.id, {...c, children: []}))
    const roots: Node[] = []
    map.forEach(node => {
        if (node.parentId) {
            const parent = map.get(node.parentId)
            if (parent) parent.children!.push(node)
            else roots.push(node)
        } else roots.push(node)
    })
    return roots
}


const TreeNode: React.FC<{node: Node, level?: number, onAdd?: (parentId: string | null) => void, onEdit?: (cat: Category) => void, onDelete?: (id: string) => void}> = ({node, level=0, onAdd, onEdit, onDelete}) => {
    const [open, setOpen] = useState(true)
    const {success, error} = useNotification();

    const handleDelete = (id: string) => {
        // Delegate deletion to parent if provided, otherwise use API directly
        if (onDelete) return onDelete(id)
        deleteCategory(id).then(() => {
            success("Udało usunąć kategorię")
        }).catch(() => {
            error("Nie udało się usunać kategorii")
        })
    }

    return (
        <Box>
            <ListItem sx={{pl: level * 3, position: 'relative', display: 'flex', alignItems: 'center', '&:hover .actionIcons': { visibility: 'visible' }}}>
                {/* collapse button on the left of the color square */}
                {node.children && node.children.length > 0 ? (
                    <IconButton size="small" onClick={() => setOpen(s => !s)} sx={{mr:1}}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                ) : (
                    <Box sx={{width: 36, height: 36, mr:1}} />
                )}

                <ListItemIcon sx={{minWidth: 0, mr: 1}}>
                    <Box sx={{width: 14, height: 14, backgroundColor: node.color || '#ccc', borderRadius: '3px'}}/>
                </ListItemIcon>

                <ListItemText primary={node.name} />

                {/* action icons - hidden by default, shown on parent hover via sx above */}
                <Box className="actionIcons" sx={{visibility: 'hidden', display: 'flex', gap: 1, alignItems: 'center'}}>
                    <Tooltip title="Dodaj podkategorię" arrow>
                        <IconButton size="small" onClick={() => onAdd ? onAdd(node.id) : null}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edytuj kategorię" arrow>
                        <IconButton size="small" onClick={() => onEdit ? onEdit(node) : null}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Usuń kategorię" arrow>
                        <IconButton color="error" size="small" onClick={() => handleDelete(node.id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

            </ListItem>

            {node.children && node.children.length > 0 && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} level={level+1} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    )
}

const CategoryTree: React.FC<Props> = ({categories, onAdd, onEdit, onDelete}) => {
    if (!categories || categories.length === 0) return <Typography color="text.secondary">Brak kategorii</Typography>
    const tree = buildTree(categories)
    return (
        <List>
            {tree.map(node => (
                <Fragment key={node.id}>
                    <TreeNode node={node} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
                </Fragment>
            ))}
        </List>
    )
}

export default CategoryTree
