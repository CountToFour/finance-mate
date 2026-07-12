import React, {useState, Fragment, useEffect} from 'react'
import {Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Collapse, Typography, Tooltip} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {useNotification} from "../../components/NotificationContext.tsx";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type {Category} from "../../types/category.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {categoryService} from "../../api/category-client.ts";
import {useTranslation} from "react-i18next";

type Props = {
    categories: Category[]
    onAdd?: (parentId: string | null) => void
    onEdit?: (cat: Category) => void
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

const TreeNode: React.FC<{node: Node, level?: number, onAdd?: (parentId: string | null) => void, onEdit?: (cat: Category) => void}> = ({node, level=0, onAdd, onEdit}) => {
    const [open, setOpen] = useState(true)
    const {success, error} = useNotification();
    const {t} = useTranslation();

    const deleteCategory = useCategoryStore(state => state.deleteCategory)
    const handleDelete = (category: Category) => {
        categoryService.deleteCategory(category.id).then(() => {
            deleteCategory(category)
            success(t('settings.page.categories.delete.success'))
        }).catch(() => {
            error(t('settings.page.categories.delete.error'))
        })
    }

    return (
        <Box>
            <ListItem sx={{pl: level * 3, position: 'relative', display: 'flex', alignItems: 'center', '&:hover .actionIcons': { visibility: 'visible' }}}>
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

                <Box className="actionIcons" sx={{visibility: 'hidden', display: 'flex', gap: 1, alignItems: 'center'}}>
                    <Tooltip title={t('settings.page.categories.add.secondLabel')} arrow>
                        <IconButton size="small" onClick={() => onAdd ? onAdd(node.id) : null}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('settings.page.categories.edit.label')} arrow>
                        <IconButton size="small" onClick={() => onEdit ? onEdit(node) : null}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('settings.page.categories.delete.label')} arrow>
                        <IconButton color="error" size="small" onClick={() => handleDelete(node)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

            </ListItem>

            {node.children && node.children.length > 0 && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} level={level+1} onAdd={onAdd} onEdit={onEdit} />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    )
}

const CategoryTree: React.FC<Props> = ({categories, onAdd, onEdit}) => {
    const {t} = useTranslation()
    const [tree, setTree] = useState<Node[]>(buildTree(categories));

    useEffect(() => {
        setTree(buildTree(categories))
    }, [categories]);
    
    if (!categories || categories.length === 0) return <Typography color="text.secondary">{t('settings.page.categories.lack')}</Typography>
    return (
        <List>
            {tree.map(node => (
                <Fragment key={node.id}>
                    <TreeNode node={node} onAdd={onAdd} onEdit={onEdit} />
                </Fragment>
            ))}
        </List>
    )
}

export default CategoryTree
