import { Grid } from "@mui/material";
import DashboardCard from "./ActiveCard";
import MessageIcon from '@mui/icons-material/Message';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useNavigate } from "react-router-dom";

const MainPageCardGroup = () => {
    const navigate = useNavigate(); 

    const handleCardClick = (cardName: string) => {
        console.log(`Clicked on: ${cardName}`);
        if (cardName === "message") {
            navigate('/chat'); 
        }
        else if (cardName === "Отзывы") {
            navigate('/chat');
        }
        else if (cardName === "Заказы") {
            navigate('/chat');
        }
        else if (cardName === "Вопросы") {
            navigate('/chat');
        }
    };

    const cards = [
        {
            title: "Сообщения",
            subtitle: "Чаты с маркетов",
            icon: <MessageIcon sx={{ color: 'white', fontSize: 30 }} />,
            onClick: () => handleCardClick("message")
        },
        {
            title: "Отзывы",
            subtitle: "Отзывы с маркетов",
            icon: <ReviewsIcon sx={{ color: 'white', fontSize: 30 }} />,
            onClick: () => handleCardClick("Отзывы")
        },
        {
            title: "Заказы",
            subtitle: "Новые заказы",
            icon: <ShoppingCartIcon sx={{ color: 'white', fontSize: 30 }} />,
            onClick: () => handleCardClick("Заказы")
        },
        {
            title: "Вопросы",
            subtitle: "Вопросы c маркетов",
            icon: <QuestionAnswerIcon sx={{ color: 'white', fontSize: 30 }} />,
            onClick: () => handleCardClick("Вопросы")
        }
    ];

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    {cards.map((card, index) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            key={index}
                        >
                            <DashboardCard
                                title={card.title}
                                subtitle={card.subtitle}
                                icon={card.icon}
                                onClick={card.onClick}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default MainPageCardGroup;