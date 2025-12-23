import Image from "next/image";
import imgHome01 from "../public/assets/banners/img_home_01.svg";
import searchImg01 from "../public/assets/banners/img_home_02.svg";
import imgSell03 from "../public/assets/banners/img_home_03.svg";

import Link from "next/link";
import styles from "./Landing.module.css";

function Landing() {
    return (
        <>
            <main>

                <section id="hero" className={styles.banner + " " + styles.hero}> 
                    <div className={styles.heroWrapper}>
                        <h1 className={styles.heroH1}>일상의 모든 물건을<br /> 거래해 보세요.</h1>
                        <Link className={styles.button + " " + styles.pillButton} href='/products'>구경하러 가기</Link>
                    </div>
                </section>


                <section id="features" className={styles.wrapper + " " + styles.features}>

                    <div className={styles.feature}>
                        <Image 
                            src={imgHome01} 
                            alt="img_home_01" 
                            width={500} 
                            height={500}
                            loading="eager"
                            className={styles.featureImage}
                            style={{ width: '100%', height: 'auto' }} // this is for < 1199px
                        />   
                        <div className={styles.featureContent}>
                            <h2 className={styles.featureTag}>Hot item</h2>
                            <h1>인기 상품을 확인해 보세요.</h1>
                            <p className={styles.featureDescription}>
                                가장 HOT한 중고거래 물품을<br /> 판다마켓에서 확인해 보세요.
                            </p>
                        </div>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureContent}>
                            <h2 className={styles.featureTag}>Search</h2>
                            <h1>구매를 원하는 상품을<br /> 검색하세요.</h1>
                            <p className={styles.featureDescription}>구매하고 싶은 물품은<br /> 검색해서 쉽게 찾아보세요.</p>
                        </div>
                        <Image 
                            src={searchImg01} 
                            alt="search_img_01" 
                            width={500} 
                            height={500}
                            loading="eager"
                            className={styles.featureImage}
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>

                    <div className={styles.feature}>
                        <Image 
                            src={imgSell03} 
                            alt="img_sell_03" 
                            width={500} 
                            height={500}
                            loading="eager"
                            className={styles.featureImage}
                            style={{ width: '100%', height: 'auto' }}
                        />
                        <div className={styles.featureContent}>
                            <h2 className={styles.featureTag}>Register</h2>
                            <h1>판매를 원하는 상품을<br /> 등록하세요.</h1>
                            <p className={styles.featureDescription}>
                                어떤 물건이든 판매하고 싶은<br /> 상품을 쉽게 등록하세요.
                            </p>
                        </div>
                    </div>

                </section>

                <section id="bottomBanner" className={styles.banner + " " + styles.bottomBanner}>
                    <div className={styles.wrapper}>
                        <h1>믿을 수 있는 판다마켓 중고거래</h1>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Landing;