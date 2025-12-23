import Link from "next/link";
import Image from "next/image";
import facebookLogo from "../public/assets/logos/facebook-logo.svg";
import twitterLogo from "../public/assets/logos/twitter-logo.svg";
import youtubeLogo from "../public/assets/logos/youtube-logo.svg";
import instagramLogo from "../public/assets/logos/instagram-logo.svg";


function Footer() {
    return (
        <>
            <div className="footerWrapper">
                <footer>
                    <div className="footerCopyright">@codeit -2025</div>
                    <div className="footerTopRow">
                        <div id="footerMenu">
                            <Link href="./privacy.html">Privacy Policy</Link>
                            <Link href="./faq.html">FAQ</Link>
                        </div>
                        <div id="socialMedia">
                            <Link href="https://www.facebook.com/" target="_blank"><Image src={facebookLogo} alt="Facebook Logo" width={20} loading="eager" /></Link>
                            <Link href="https://www.twitter.com/" target="_blank"><Image src={twitterLogo} alt="Twitter Logo" width={20} loading="eager" /></Link>
                            <Link href="https://www.youtube.com" target="_blank"><Image src={youtubeLogo} alt="Youtube Logo" width={20} loading="eager" /></Link>
                            <Link href="https://www.instagram.com" target="_blank"><Image src={instagramLogo} alt="Instagram Logo" width={20} loading="eager" /></Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Footer;