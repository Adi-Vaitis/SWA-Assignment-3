import React from "react";
import {BoardItem} from "../BoardItem/BoardItem";

export class Board extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render(): any {
        var plm = [
            ['bmw.png', 'bmw.png', 'bmw.png'],
            ['bmw.png', 'bmw.png', 'bmw.png'],
            ['bmw.png', 'bmw.png', 'bmw.png']
        ];

        return (
            <div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${plm[0].length}, 100px)`,
                    gridTemplateRows: `repeat(${plm.length}, 100px)`,
                    gridGap: '0.5rem',
                }}>
                    {plm.map((row: any, rowIndex: number) => (
                        <div key={rowIndex}>
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