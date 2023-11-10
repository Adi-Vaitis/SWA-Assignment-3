import React, {useEffect, useState} from "react";
import {BoardItem} from "../BoardItem/BoardItem";
import * as Board from "../../Model/board";
import {MainPageState} from "../../Pages/MainPage/MainPage.state";
import {Game} from "../../Model/game";

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
    }
    updateMoveOnBoard: (selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) => void;
}

export const BoardComponent = (props: BoardComponentProps) => {
    const [board, setBoard] = useState(props.game.board);
    const [selectedPositionToMove, setSelectedPositionToMove] = React.useState<Board.Position>({row: -1, col: -1});
    const [selectedPositionToMoveTo, setSelectedPositionToMoveTo] = React.useState<Board.Position>({row: -1, col: -1});
    const [positionToMoveAlreadySelected, setPositionToMoveAlreadySelected] = React.useState(false);

    useEffect(() => {
        setBoard(props.game.board);
    }, [props.game.board]);

    function positionIsNotEqualWithDefaultValues(position: Board.Position) {
        return position.col !== -1 && position.row !== -1;
    }

    // TODO styling when those are selected
    function makeMove() {
        if(positionIsNotEqualWithDefaultValues(selectedPositionToMove) && positionIsNotEqualWithDefaultValues(selectedPositionToMoveTo)) {
            props.updateMoveOnBoard(selectedPositionToMove, selectedPositionToMoveTo, {
                isFetching: props.game.isFetching,
                gameId: props.game.gameId,
                board: board,
                score: props.game.score,
                maxMoveNumber: props.game.maxMoveNumber,
                currentMoveNumber: props.game.currentMoveNumber,
                completed: props.game.completed,
                games: props.game.games,
            });
            setSelectedPositionToMove({row: -1, col: -1});
            setSelectedPositionToMoveTo({row: -1, col: -1});
            setPositionToMoveAlreadySelected(false);
        }
    }

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {board.board.map((row: any, rowIndex: number) => (
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
                                if(!positionToMoveAlreadySelected) {
                                    setSelectedPositionToMove({row: rowIndex, col: colIndex});
                                    setPositionToMoveAlreadySelected(true);
                                }
                                else {
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
