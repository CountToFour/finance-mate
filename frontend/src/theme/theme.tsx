import { createTheme } from '@mui/material/styles';

const commonColors = {
    beige: "#F7F5F3",
    gold: "#EBE6CD",
    lightBlue: "#70B2B1",
    purple: "#A175BF",
    blue: "#5C86D3",
};

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: commonColors.beige,
            paper: "#ffffff",
        },
        primary: {
            main: commonColors.blue,
        },
        secondary: {
            main: commonColors.purple,
        },
        text: {
            primary: "#000000",
            secondary: "#4f4f4f",
        }
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#121212",
            paper: "#1f1f1f",
        },
        primary: {
            main: commonColors.blue,
        },
        secondary: {
            main: commonColors.purple,
        },
        warning: {
            main: commonColors.gold,
        },
        text: {
            primary: "#ffffff",
            secondary: "#b3b3b3",
        },
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});