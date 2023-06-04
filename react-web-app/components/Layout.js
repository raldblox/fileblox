import React, { useRef, useEffect, useState, useContext } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Nav from "./Nav";

const Layout = ({ children }) => {

    return (
        <>
            <Header />
            <div>
                <Nav />
                <main >{children}</main>
                <Footer />
            </div>
        </>
    );
};

export default Layout;
