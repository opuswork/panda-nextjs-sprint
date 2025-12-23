import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SecondHandMarket from "../../components/SecondHandMarket";

export default async function Products() {

  const response = await fetch(
    "http://localhost:3001/api/products",
    { cache: "force-cache" } // 빌드 시 캐시 -> SSG
  );
  const data = await response.json();
  const products = data.products;


  return (
    <>
      <Header />
      <SecondHandMarket products={products} />
      <Footer />
    </>
  );
}

