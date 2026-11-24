import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingCallButton from "./components/FloatingCallButton";

export const metadata = {
  title: "Sheikh Drugs House",
  description: "ঔষধের ব্যবহার, খাওয়ার নিয়ম ও পার্শ্বপ্রতিক্রিয়ার ডিরেক্টরি",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <div className="container" style={{ paddingTop: "20px" }}>
          {/* Static Navbar */}
          <Navbar />
          {children}
          {/* Static Footer */}
          <Footer />
        </div>
        {/* Floating Direct Call Button */}
        <FloatingCallButton />
      </body>
    </html>
  );
}