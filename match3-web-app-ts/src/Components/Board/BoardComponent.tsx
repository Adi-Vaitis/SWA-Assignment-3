import React from "react";
import {BoardItem} from "../BoardItem/BoardItem";
import * as Board from "./../../Model/board";

export class BoardComponent extends React.Component<any, any> {

    private board: Board.Board<String>;
    constructor(props: any) {
        super(props);
        this.board = this.props.board;
    }

    render(): any {
        return (
            <div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {this.board.board.map((row: any, rowIndex: number) => (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '0.5rem',
                        }} key={rowIndex}>
                            {row.map((col: any, colIndex: number) => (
                                <BoardItem key={colIndex} image={col} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}