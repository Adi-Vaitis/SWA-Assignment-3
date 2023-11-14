import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {connect, Provider} from "react-redux";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {createStore} from "redux";
import {Token} from "../../../Model/token";
import {Game} from "../../../Model/game";
import {
    highScorePageMapDispatchToProps,
    highScorePageMapStateToProps,
    highScorePageReducer
} from "./HighScorePage.state";

const defaultTheme = createTheme();

interface HighScorePageProps {
    token: Token,
    isFetching: boolean,
    highScoreGames: Game[],
    userHighScoreGames: Game[],
    fetchGames: () => void,
}

export const HighScorePageComponent = (props: HighScorePageProps) => {


    React.useEffect(() => {
        props.fetchGames();
    }, []);

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
                        High Score Page
                    </Typography>
                </Box>
                <Typography component="h1" variant="h5">
                    10 Highest Scores Games </Typography>
                {
                    props.highScoreGames.map((game: Game) => {
                        return (
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }} key={game.id}>
                                <div>Game id: {game.id}</div>
                                <div>Score: {game.score}</div>
                            </div>
                        );
                    })
                }
                <Typography component="h1" variant="h5">
                    3 of your highest score games </Typography>
                {
                    props.userHighScoreGames.map((game: Game) => {
                        return (
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                                 key={game.id}>
                                <div>Game id: {game.id}</div>
                                <div>Score: {game.score}</div>
                            </div>
                        );
                    })
                }
            </Container>
        </ThemeProvider>
    );
}

const ReduxHighScorePage = connect(highScorePageMapStateToProps, highScorePageMapDispatchToProps)(HighScorePageComponent);
const store = createStore(highScorePageReducer);

export const HighScorePage = ({token}: any) => {
    return (
        <Provider store={store}>
            <ReduxHighScorePage token={token} userId={token.userId}/>
        </Provider>
    );
}