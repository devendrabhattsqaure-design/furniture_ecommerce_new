// admin-panel/src/layouts/auth.jsx
import { Routes, Route } from "react-router-dom";
import { authRoutes } from "@/routes";

export function Auth() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 z-0 h-full w-full bg-white" />
      
      {/* Content */}
      <div className="relative z-10">
        <Routes>
          {authRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </div>
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;