import "m3-expressive-react/styles.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "m3-expressive-react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { AdminLayout } from "@/layouts/AdminLayout";
import { LoginRoot } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AccountsPage } from "@/pages/AccountsPage";
import { FilesPage } from "@/pages/FilesPage";
import { ModerationPage } from "@/pages/ModerationPage";
import { CompliancePage } from "@/pages/CompliancePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import "@/styles/global.scss";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider seedColor="#4F5B93" mode="light">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoot />} />
            <Route
              path="/"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="moderation" element={<ModerationPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="tools" element={<ToolsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}