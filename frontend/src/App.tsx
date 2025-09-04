import { RouterProvider } from 'react-router-dom'
import {router} from "./routes.tsx";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {darkTheme, lightTheme} from "./theme/theme.tsx";
import {useState} from "react";

export default function App() {
    const [darkMode, setDarkMode] = useState(true)

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline/>
            <RouterProvider router={router} />
        </ThemeProvider>
    )
}
