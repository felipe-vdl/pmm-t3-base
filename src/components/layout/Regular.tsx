import Navbar from "../UI/Navbar";
import Footer from "../UI/Footer";

interface RegularLayoutProps {
  children: any;
}

export default function RegularLayout({ children }: RegularLayoutProps) {
  return (
    <div className="bg-light-900 dark:bg-dark-900 flex min-h-screen flex-col">
      <div id="notifications" />
      <div id="modal" />
      <Navbar />
      <main className="w-full flex flex-1 bg-light-900 text-light-50 dark:bg-dark-900 dark:text-dark-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}
