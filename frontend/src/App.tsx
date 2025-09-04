import { RouterProvider } from 'react-router-dom'
import {router} from "./routes.tsx";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "./theme/theme.tsx";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <RouterProvider router={router} />
        </ThemeProvider>
    )
}
