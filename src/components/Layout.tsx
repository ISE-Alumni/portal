import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-foreground">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl tracking-tight"><b>[ISE]</b> ALUMNI</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/events" className="underline-offset-4 hover:underline">Events</Link>
            <Link to="/map" className="underline-offset-4 hover:underline">Map</Link>
            <Link to="/news" className="underline-offset-4 hover:underline">News</Link>
          </nav>
          <div className="flex items-center gap-4">
            {!loading && user && <span className="text-xs uppercase">Signed in</span>}
            {!loading && user && (
              <Button variant="outline" size="sm" className="border-foreground hover:bg-foreground hover:text-background" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 flex-1">
        {children}
      </main>

      <footer className="border-t border-foreground">
        <div className="container mx-auto px-4 py-4 text-xs flex justify-between">
          <span>© {new Date().getFullYear()} ISE Alumni</span>
          <span className="opacity-70">By alumni, for alumni.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;


