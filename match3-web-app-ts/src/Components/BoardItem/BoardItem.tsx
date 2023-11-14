import React from "react";
import './BoardItem.css';
import * as Board from "../../Model/board";

export interface BoardItemProps {
    image: string;
    isSelected: boolean;
    onClick: () => void;
}

export const BoardItem = (props: BoardItemProps) => {
    const getImage = () => {
        return <img style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            border: props.isSelected ? '2px solid yellow' : 'none'
        }} src={require(`../../Assets/BoardImages/${props.image}`)}
        onClick={props.onClick}/>;
    }

    return (
        <div className="board-item-container">
            {getImage()}
        </div>
    )
}
