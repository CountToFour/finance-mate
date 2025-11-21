import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Stack,
    Chip,
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Budget, Category} from "../../lib/types";

const hexToRgba = (hex: string, alpha = 0.2) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const percent = (spent: number, limit: number) =>
    limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

const money = (v: number) =>
    v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " zł";


const BudgetCard: React.FC<{
    budget: Budget;
    category?: Category | null;
    onEdit: (b: Budget) => void;
    onDelete: (id: string) => void;
}> = ({ budget, category, onEdit, onDelete }) => {
    const pct = percent(budget.spentAmount, budget.limitAmount);
    const accent = category?.color ?? "#6b7280";
    // const bg = hexToRgba(accent, 0.12);

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            {/* Pasek akcentu u góry */}
            <Box sx={{ height: 6, background: accent, width: "100%" }} />

            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                                {budget.categoryName}
                            </Typography>
                            {category && (
                                <Chip
                                    label={`${Math.round(pct)}%`}
                                    size="small"
                                    sx={{
                                        backgroundColor: hexToRgba(accent, 0.14),
                                        color: accent,
                                        fontWeight: 700,
                                        borderRadius: 1,
                                        border: `1px solid ${hexToRgba(accent, 0.5)}`,
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {money(budget.spentAmount)} z {money(budget.limitAmount)}
                        </Typography>
                    </Box>

                    <Box>
                        <Tooltip title="Edytuj budżet">
                            <IconButton size="small" onClick={() => onEdit(budget)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń budżet">
                            <IconButton size="small" onClick={() => onDelete(budget.id)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>

                <Box sx={{ mt: 1 }}>
                    <Box
                        sx={{
                            height: 12,
                            background: "#f1f5f9",
                            borderRadius: 3,
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                height: "100%",
                                width: `${pct}%`,
                                background: accent,
                                transition: "width 0.4s ease",
                            }}
                        />
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="body2" color="success.main">
                            Pozostało: {money(Math.max(budget.limitAmount - budget.spentAmount, 0))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {pct.toFixed(1)}%
                        </Typography>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BudgetCard;