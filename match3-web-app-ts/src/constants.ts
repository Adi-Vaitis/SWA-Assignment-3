import {notification} from "antd";

export const handleMenuRouting = (key: string, navigate: (path: string) => void) => {
    switch (key) {
        case 'logout':
            localStorage.removeItem('token');
            window.location.reload();
            break;
        // just routing to the desired key, if there is nothing else to do
        default:
            
            navigate(`/${key}`);
    }
};

// notifications
