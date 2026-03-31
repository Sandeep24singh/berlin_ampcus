import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppShell } from "./layouts/AppShell";
import { FeedPage } from "./pages/FeedPage";
import { AuthPage } from "./pages/AuthPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { ModeratorDashboardPage } from "./pages/ModeratorDashboardPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moderation"
              element={
                <ProtectedRoute moderatorOnly>
                  <ModeratorDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
