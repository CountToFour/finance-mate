import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
    palette: {
        background: {
            default: "#201f1f",
        },
        primary: {
            main: "#5C86D3",
        },
        secondary: {
            main: "#A175BF",
        },
        info: {
            main: "#7AB6D1",
        },
        warning: {
            main: "#CDB557",
        },
        text: {
            primary: "#F7F5F3",
            secondary: "#555555",
        },
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});

// palette: {
//     background: {
//     default: "#F7F5F3",
//     },
//     primary: {
//         main: "#5C86D3",
//     },
//     secondary: {
//         main: "#A175BF",
//     },
//     info: {
//         main: "#7AB6D1",
//     },
//     warning: {
//         main: "#CDB557",
//     },
//     text: {
//         primary: "#333333",
//             secondary: "#555555",
//     },
// },