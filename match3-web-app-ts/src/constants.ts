export const handleMenuRouting = (key: string) => {
    switch (key) {
        case 'logout':
            localStorage.removeItem('token');
            window.location.reload();
            break;
        case 'login':
            window.location.href = '/login';
            break;
        case 'mainPage' :
            window.location.href = '/mainPage';
            break;
        case 'profile':
            window.location.href = '/profile';
            break;
    }
}