import React from "react";
import './BoardItem.css';
import * as Board from "../../Model/board";

export interface BoardItemProps {
    image: string;
}

export const BoardItem = (props: BoardItemProps) => {
    const getImage = () => {
        return <img style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain'
        }} src={require(`../../Assets/BoardImages/${props.image}`)}/>;
    }

    return (
        <div className="board-item-container">
            {getImage()}
        </div>
    )
}
