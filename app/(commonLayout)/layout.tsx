import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary transition-colors duration-300">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-grow">
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
