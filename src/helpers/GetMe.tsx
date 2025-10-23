import axios from 'axios';

const getMe = async (token: string | null, navigate: Function) => {
    try {
        const response = await axios.get('http://45.144.178.5/api/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        navigate('/login'); 
        console.error('Failed to fetch user data:', error);
        throw new Error('Auth Error');
    }
};

export default getMe;