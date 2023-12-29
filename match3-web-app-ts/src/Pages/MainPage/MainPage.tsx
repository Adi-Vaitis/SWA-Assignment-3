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
                               game,
                               fetchInitialBoardGame,
                               updateMoveOnBoard,
                               updateGame,
                               endGame,
                               resetNotMatchesFound,
                               endGameWithNoMovesLeft,
                           }: any) => {

    function propsToMapPageState() {
        return {
            isFetching: game.isFetching,
            gameId: game.gameId,
            board: game.board,
            score: game.score,
            maxMoveNumber: game.maxMoveNumber,
            currentMoveNumber: game.currentMoveNumber,
            completed: game.completed,
            games: game.games,
            movedItems: game.movedItems,
            notFoundMatches: game.notFoundMatches,
            gameEnded: game.gameEnded,
            gameEndedWithNoMovesLeft: game.gameEndedWithNoMovesLeft,
        };
    }

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
                    {game.gameEndedWithNoMovesLeft && (
                    <Typography component="h1" variant="h5">
                        Your game has ended because there were no moves.
                    </Typography>
                    )}
                    {game.gameId && (
                        <BoardComponent
                            game={game}
                            updateMoveOnBoard={updateMoveOnBoard}
                            updateGame={updateGame}
                            resetNotMatchesFound={resetNotMatchesFound}
                            endGameWithNoMovesLeft={endGameWithNoMovesLeft}
                        ></BoardComponent>
                    )}
                    <div>
                        {!game.gameId && (
                            <Button
                                onClick={() => {
                                    fetchInitialBoardGame(propsToMapPageState());
                                }}
                            >
                                Start new game
                            </Button>
                        )}
                        {(game.gameId && !game.gameEnded) && (
                            <Button
                                onClick={() => {
                                    endGame(propsToMapPageState());
                                }}
                            >
                                End current game
                            </Button>
                        )}
                    </div>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

// specifying the props mapped from the redux in the main page component's props
const ReduxMainPage = connect(mainPageMapStateToProps, mainPageMapDispatchToProps)(MainPageComponent);
const store = createStore(mainPageReducer);

export const MainPage = ({token}: any) => {
    return (
        <Provider store={store}>
            <ReduxMainPage token={token} userId={token.userId}/>
        </Provider>
    )
}
