"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../public/assets/logos/panda_logo.svg";
import mobileLogo from "../public/assets/logos/logo-mobile.svg";
// ✅ Import the settings icon (ensure this path is correct)
import icSettings from "../public/assets/icons/ic_settings.svg";
// ✅ Import the logout icon
import icLogout from "../public/assets/icons/ic_logout.svg";

function Header() {
    const location = usePathname();
    const router = useRouter();
    const isLandingPage = location === '/';

    // ✅ State to track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ✅ Check for 'user' cookie on mount
    useEffect(() => {
        const checkLoginStatus = () => {
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            };
            
            // Check if 'user' cookie exists
            const userCookie = getCookie('user');
            setIsLoggedIn(!!userCookie); // Set true if cookie exists, false otherwise
        };

        checkLoginStatus();
        
    }, [location]); // Re-check when the user navigates to a new page

    // ✅ Logout Handler
    const handleLogout = () => {
        // Delete the cookie by setting max-age to 0
        document.cookie = "user=; path=/; max-age=0";
        setIsLoggedIn(false);
        router.push('/'); // Redirect to home page
    };

    return (
        <>
            <header>
                <div className="headerWrapper">
                    <div className="headerLeft">
                        <Link href="/">
                            <Image 
                                src={logo} 
                                alt="Panda Market Logo" 
                                width={153} 
                                height={51}
                                loading="eager"
                                className="desktopLogo"
                            />
                            <Image 
                                src={mobileLogo} 
                                alt="Panda Market Logo" 
                                width={81} 
                                height={40}
                                loading="eager"
                                className="mobileLogo"
                            />
                        </Link>
                        {!isLandingPage && (
                            <div className="headerRight">
                                <Link 
                                    href="/articles" 
                                    className="navLink"
                                >자유게시판</Link>
                                <Link 
                                    href="/products" 
                                    className="navLink"
                                >중고마켓</Link> 
                            </div>
                        )}
                    </div>

                    <div className={
                            isLoggedIn
                                ? "headerAuthButtons headerAuthButtonsCentered"
                                : "headerAuthButtons"
                        }
                    >
                        {/* ✅ Conditional Rendering based on isLoggedIn */}
                        {isLoggedIn ? (
                            <div className="headerAuthButtonsContainer">
                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout} 
                                    className="button"
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize: '16px',
                                        padding: '0', // Remove default button padding to match links
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <span className="logoutText">로그아웃</span>
                                <Image 
                                    src={icLogout} 
                                    alt="Logout" 
                                    width={24} 
                                    height={24}
                                    className="logoutIcon"
                                    style={{ cursor: 'pointer' }}
                                />
                                </button>
                                <Link href="/settings">
                                    <Image 
                                        src={icSettings} 
                                        alt="Settings" 
                                        width={24} 
                                        height={24} 
                                        className="settingsIcon"
                                    />
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Original Login/Signup Buttons */}
                                <Link href="/auth" id="loginLinkButton" className="button">로그인</Link>
                            </>
                            )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;