import React from 'react';
import homeImg from '../assets/home.png'; // Placeholder: Replace with your classroom image (e.g. dashboard.png)

const Dashboard = () => {
    return (
        <div className="h-[calc(100vh-64px)]">
            <img
                src={homeImg}
                alt="Welcome to HS Learning Center"
                className="w-full h-full object-contain "
            />
        </div>
    );
};

export default Dashboard;
