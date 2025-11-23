import React, {useState, Fragment} from 'react'
import type {Category} from '../../lib/types'
import {Box, IconButton, List, ListItem, ListItemIcon, ListItemText, Collapse, Typography} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import LabelIcon from '@mui/icons-material/Label'

type Props = {
    categories: Category[]
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

const TreeNode: React.FC<{node: Node, level?: number}> = ({node, level=0}) => {
    const [open, setOpen] = useState(true)
    return (
        <Box>
            <ListItem sx={{pl: level * 3}}>
                <ListItemIcon>
                    <Box sx={{width: 14, height: 14, backgroundColor: node.color || '#ccc', borderRadius: '3px'}}/>
                </ListItemIcon>
                <ListItemText primary={node.name} />
                {node.children && node.children.length > 0 && (
                    <IconButton size="small" onClick={() => setOpen(s => !s)}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </ListItem>

            {node.children && node.children.length > 0 && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} level={level+1} />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    )
}

const CategoryTree: React.FC<Props> = ({categories}) => {
    if (!categories || categories.length === 0) return <Typography color="text.secondary">Brak kategorii</Typography>
    const tree = buildTree(categories)
    return (
        <List>
            {tree.map(node => (
                <Fragment key={node.id}>
                    <TreeNode node={node} />
                </Fragment>
            ))}
        </List>
    )
}

export default CategoryTree
