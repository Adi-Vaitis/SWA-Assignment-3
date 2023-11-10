import React from "react";
import './BoardItem.css';
import { Image } from "antd";

export interface BoardItemProps {
    image: string;
}

export const BoardItem = (props: BoardItemProps) => {
    const getImage = () => {
        return <img style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain'
        }} src={require(`../../Assets/BoardImages/${props.image}`)} />;
    }

    const onClickEvent = (event: any) => {
        event.preventDefault();
        alert('clicked');
    }

    return (
        <div onClick={onClickEvent} style={{

        }} className="board-item-container">
            {getImage()}
        </div>
    )
}
