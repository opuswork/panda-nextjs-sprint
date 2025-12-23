import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewArticle from "@/components/viewArticle";

export default async function ViewArticlePage({ params }) {
  const { id } = await params;
  return (
    <>
      <Header />
      <ViewArticle id={id} />
      <Footer />
    </>
  );
}
