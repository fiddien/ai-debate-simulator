import { ReactNode } from "react";
import { FaComments, FaRobot } from "react-icons/fa";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-white shadow-md py-4">
          <div className="max-w-4xl mx-auto px-2 py-2 flex flex-col items-center space-y-2">
            {/* <FaBalanceScale size={32} /> */}
            <div className="inline-flex items-center justify-center space-x-2">
              <FaRobot size={32} />{" "}
              <FaComments size={32} className="text-teal-600" />{" "}
              <FaRobot size={32} />
            </div>
            <h1 className="text-2xl font-bold text-center">
              AI Structured Debate: Moral Situation
            </h1>
            <h2 className="text-xl text-center mt-2">A Visualization</h2>
          </div>
        </header>
        <main className="py-6">{children}</main>
      </div>
    </>
  );
}
