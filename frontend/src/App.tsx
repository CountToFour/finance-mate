import { RouterProvider } from 'react-router-dom'
import {router} from "./routes.tsx";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {darkTheme, lightTheme} from "./theme/theme.tsx";
import {useState} from "react";
import {NotificationProvider} from "./components/NotificationContext.tsx";

export default function App() {
    const [darkMode, setDarkMode] = useState(false)

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <NotificationProvider>
                <CssBaseline/>
                <RouterProvider router={router} />
            </NotificationProvider>
        </ThemeProvider>
    )
}
