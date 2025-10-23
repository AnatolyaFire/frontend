
import getMe from "../helpers/GetMe";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "../components/navBar";
import MainPageCardGroup from "../components/MainPageCardGroup";

function MainPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await getMe(token, navigate);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, [token, navigate]);

    return (
        <>
            <NavBar />
            <MainPageCardGroup />
        </>
    );
}

export default MainPage;