import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {Board} from "../../Components/Board/Board";

const defaultTheme = createTheme();

export const MainPageComponent = () => {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Main Page
                    </Typography>
                    <Box component="form" noValidate sx={{mt: 1}}>
                        <Board/>
                    </Box>
                    {/*TODO start a game and show board if game is started*/}
                </Box>
            </Container>
        </ThemeProvider>
    )
}
