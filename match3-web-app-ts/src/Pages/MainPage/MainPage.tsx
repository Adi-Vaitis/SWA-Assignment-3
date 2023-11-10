import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {connect, Provider} from "react-redux";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {mainPageMapDispatchToProps, mainPageMapStateToProps, mainPageReducer} from "./MainPage.state";
import {createStore} from "redux";
import {Button} from "antd";
import {BoardComponent} from "../../Components/Board/BoardComponent";

const defaultTheme = createTheme();

const MainPageComponent = ({
                               token,
                               game,
                               fetchInitialBoardGame,
                               updateMoveOnBoard,
                                updateGame,
                           }: any) => {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
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
                    {game.gameId && (
                        <BoardComponent
                            game={game}
                            updateMoveOnBoard={updateMoveOnBoard}
                            updateGame={updateGame}
                        ></BoardComponent>
                    )}
                    <div>
                        <Button
                            onClick={() => {
                                fetchInitialBoardGame(token);
                            }}
                        >
                            Start new game
                        </Button>
                    </div>
                </Box>
            </Container>
        </ThemeProvider>
    );
};


const ReduxMainPage = connect(mainPageMapStateToProps, mainPageMapDispatchToProps)(MainPageComponent);
const store = createStore(mainPageReducer);

export const MainPage = ({token}: any) => {
    return (
        <Provider store={store}>
            <ReduxMainPage token={token} userId={token.userId}/>
        </Provider>
    )
}
