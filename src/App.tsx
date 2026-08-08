import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { DashboardSkeleton } from "./components/ui/Skeletons/DashboardSkeleton";

// Auth & Admin Domains
const AuthLayout = lazy(() =>
  import("./domains/auth/layout/AuthLayout").then((m) => ({
    default: m.AuthLayout,
  })),
);
const LoginView = lazy(() =>
  import("./domains/auth/views/LoginView").then((m) => ({
    default: m.LoginView,
  })),
);
const ProtectedRoute = lazy(() =>
  import("./domains/auth/components/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  })),
);
const AdminLayout = lazy(() =>
  import("./domains/admin/layout/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const DashboardView = lazy(() =>
  import("./domains/admin/views/DashboardView").then((m) => ({
    default: m.DashboardView,
  })),
);
const ModerationView = lazy(() =>
  import("./domains/moderation/views/ModerationView").then((m) => ({
    default: m.ModerationView,
  })),
);

// Workspace Domain
const WorkspaceLayout = lazy(() =>
  import("./domains/workspace/components/WorkspaceLayout").then((m) => ({
    default: m.WorkspaceLayout,
  })),
);
const WorkspaceView = lazy(() =>
  import("./domains/workspace/views/WorkspaceView").then((m) => ({
    default: m.WorkspaceView,
  })),
);
const BusinessView = lazy(() =>
  import("./domains/workspace/views/BusinessView").then((m) => ({
    default: m.BusinessView,
  })),
);
const ServicesView = lazy(() =>
  import("./domains/workspace/views/ServicesView").then((m) => ({
    default: m.ServicesView,
  })),
);
const LandingView = lazy(() =>
  import("./domains/workspace/views/LandingView").then((m) => ({
    default: m.LandingView,
  })),
);
// Placeholder views
const GalleryView = lazy(() =>
  import("./domains/workspace/views/PlaceholderViews").then((m) => ({
    default: m.GalleryView,
  })),
);
const AppearanceView = lazy(() =>
  import("./domains/workspace/views/PlaceholderViews").then((m) => ({
    default: m.AppearanceView,
  })),
);
const PromotionsView = lazy(() =>
  import("./domains/workspace/views/PlaceholderViews").then((m) => ({
    default: m.PromotionsView,
  })),
);
const BookingsView = lazy(() =>
  import("./domains/workspace/views/PlaceholderViews").then((m) => ({
    default: m.BookingsView,
  })),
);
const ReviewSettingsView = lazy(() =>
  import("./domains/workspace/views/PlaceholderViews").then((m) => ({
    default: m.ReviewSettingsView,
  })),
);

const Landing = lazy(() =>
  import("./landing/Landing").then((m) => ({ default: m.default })),
);

const PortfolioPage = lazy(() =>
  import("./portfolio/PortfolioPage").then((m) => ({ default: m.default })),
);

const PublicSite = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center animate-pulse text-brand-text-muted font-sans text-[10px] tracking-[0.3em] uppercase">
        K A R I N
      </div>
    }
  >
    <Landing />
  </Suspense>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Suspense
        fallback={
          <div className="min-h-screen bg-brand-surface flex items-center justify-center animate-pulse">
            Iniciando aplicación...
          </div>
        }
      >
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<PublicSite />} />
          <Route path="/portafolio" element={
            <Suspense fallback={
              <div className="min-h-screen bg-[rgb(255,254,253)] flex items-center justify-center animate-pulse text-[rgb(74,36,50)] font-sans text-[10px] tracking-[0.3em] uppercase">
                Cargando...
              </div>
            }>
              <PortfolioPage />
            </Suspense>
          } />

          {/* Authentication */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginView />} />
            <Route index element={<Navigate to="login" replace />} />
          </Route>

          {/* Protected Admin Dashboard */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <DashboardView />
                  </Suspense>
                }
              />
              {/* Future Routes */}
              <Route
                path="moderation"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ModerationView />
                  </Suspense>
                }
              />
              <Route
                path="insights"
                element={<div>Insights Placeholder</div>}
              />
              <Route
                path="invitations"
                element={<div>Invitations Placeholder</div>}
              />
              <Route
                path="settings"
                element={<div>Settings Placeholder</div>}
              />

              {/* Workspace Module */}
              <Route
                path="workspace"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <WorkspaceLayout />
                  </Suspense>
                }
              >
                <Route index element={<WorkspaceView />} />
                <Route path="business" element={<BusinessView />} />
                <Route path="services" element={<ServicesView />} />
                <Route path="landing" element={<LandingView />} />
                <Route path="gallery" element={<GalleryView />} />
                <Route path="appearance" element={<AppearanceView />} />
                <Route path="promotions" element={<PromotionsView />} />
                <Route path="bookings" element={<BookingsView />} />
                <Route
                  path="reviews-settings"
                  element={<ReviewSettingsView />}
                />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
