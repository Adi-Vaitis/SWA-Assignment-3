import React, {useEffect, useState} from "react";
import {BoardItem} from "../BoardItem/BoardItem";

export const BoardComponent = (props: any) => {
    const [board, setBoard] = useState(props.board);

    useEffect(() => {
        setBoard(props.board);
    }, [props.board]);

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
                            <BoardItem key={colIndex} image={col}/>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
