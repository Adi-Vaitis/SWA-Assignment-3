export const Redirect = ({to}: any) => {
    window.location.href = to;
    return (
        <div>
            You will be redirected to login page...
        </div>
    );
}