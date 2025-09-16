import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-secondary" dir="rtl">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-wathiq-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-wathiq-primary" />
        </div>
        <h1 className="mb-4 text-6xl font-bold text-wathiq-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mb-8 text-muted-foreground">
          عذراً، الصفحة التي تبحث عنها غير متاحة أو تم نقلها إلى موقع آخر
        </p>
        <Button 
          asChild 
          className="bg-wathiq-primary hover:bg-wathiq-primary/90"
        >
          <a href="/">
            <Home className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
