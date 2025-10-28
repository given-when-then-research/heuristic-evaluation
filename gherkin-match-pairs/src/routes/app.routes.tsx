import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "@/pages/Home";
import Match from "@/pages/Match";


const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index path="/" element={<Home />} />
            <Route index path="/match" element={<Match />} />
        </Routes>
    );
};

export default AppRoutes;