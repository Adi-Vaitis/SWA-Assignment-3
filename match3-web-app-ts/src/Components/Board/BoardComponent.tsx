import React, {useEffect, useState} from "react";
import {BoardItem} from "../BoardItem/BoardItem";
import * as Board from "../../Model/board";
import {MainPageState} from "../../Pages/MainPage/MainPage.state";
import {Game} from "../../Model/game";
import {notification} from "antd";

export interface BoardComponentProps {
    game: {
        isFetching: boolean,
        gameId: number,
        board: Board.Board<string>,
        score: number,
        maxMoveNumber: number,
        currentMoveNumber: number,
        completed: boolean,
        games: Game[],
        movedItems: boolean,
        notFoundMatches: boolean;
    }
    updateMoveOnBoard: (selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) => void;
    updateGame: (currentState: MainPageState) => void;
}

export const BoardComponent = (props: BoardComponentProps) => {
    const [game, setGame] = useState(props.game);
    const [beforeScore, setBeforeScore] = useState(0);
    const [nowScore, setNowScore] = useState(0);
    const [previousMoveNumber, setPreviousMoveNumber] = useState(0);
    const [currentMoveNumber, setCurrentMoveNumber] = useState(0);
    const [selectedPositionToMove, setSelectedPositionToMove] = React.useState<Board.Position>({row: -1, col: -1});
    const [selectedPositionToMoveTo, setSelectedPositionToMoveTo] = React.useState<Board.Position>({row: -1, col: -1});
    const [positionToMoveAlreadySelected, setPositionToMoveAlreadySelected] = React.useState(false);

    type NotificationType = 'success' | 'info' | 'warning' | 'error';
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (type: NotificationType, description: string, title?: string) => {
        api[type]({
            message: title ? title : 'Notification',
            description: description
        });
    };

    useEffect(() => {
        if (props.game.movedItems) {
            openNotification('success','Found match! Items moved! Current score: ' + props.game.score);
        }
    }, [props.game.movedItems]);

    useEffect(() => {
        // THIS IS CALLED TWICE
        if (props.game.notFoundMatches) {
            openNotification('error',`No matches found! Try again!`);
        }
    }, [props.game.notFoundMatches]);

    useEffect(() => {
        setPreviousMoveNumber(currentMoveNumber);
        setCurrentMoveNumber(props.game.currentMoveNumber);
        if (currentMoveNumber !== previousMoveNumber) {
            openNotification('warning','Left moves: ' + (props.game.maxMoveNumber - props.game.currentMoveNumber));
        }
    }, [props.game.currentMoveNumber]);

    useEffect(() => {
        setBeforeScore(game.score);
        setGame(props.game);
        setNowScore(props.game.score);
        // TODO  check if the current move number exceeds
    }, [props.game]);

    function positionIsNotEqualWithDefaultValues(position: Board.Position) {
        return position.col !== -1 && position.row !== -1;
    }

    function propsToMapPageState() {
        return {
            isFetching: props.game.isFetching,
            gameId: props.game.gameId,
            board: props.game.board,
            score: props.game.score,
            maxMoveNumber: props.game.maxMoveNumber,
            currentMoveNumber: props.game.currentMoveNumber,
            completed: props.game.completed,
            games: props.game.games,
            movedItems: props.game.movedItems,
            notFoundMatches: props.game.notFoundMatches,
        };
    }

    // TODO styling when those are selected
    function makeMove() {
        if (positionIsNotEqualWithDefaultValues(selectedPositionToMove) && positionIsNotEqualWithDefaultValues(selectedPositionToMoveTo)) {
            props.updateMoveOnBoard(selectedPositionToMove, selectedPositionToMoveTo, propsToMapPageState());
            setSelectedPositionToMove({row: -1, col: -1});
            setSelectedPositionToMoveTo({row: -1, col: -1});
            setPositionToMoveAlreadySelected(false);

            if (beforeScore !== nowScore) {
                props.updateGame(propsToMapPageState());
            }
        }
    }

    return (
        <div>
            {contextHolder}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {props.game.board.board.map((row: any, rowIndex: number) => (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "0.5rem",
                        }}
                        key={rowIndex}
                    >
                        {row.map((col: any, colIndex: number) => (
                            <span key={colIndex} onClick={() => {
                                if (!positionToMoveAlreadySelected) {
                                    setSelectedPositionToMove({row: rowIndex, col: colIndex});
                                    setPositionToMoveAlreadySelected(true);
                                } else {
                                    setSelectedPositionToMoveTo({row: rowIndex, col: colIndex});
                                    makeMove();
                                }
                            }}>
                                <BoardItem
                                    image={col}/>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
