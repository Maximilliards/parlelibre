import { RouterProvider, useRouter } from '@/lib/router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { PublicLayout } from '@/components/PublicLayout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { TestimonialsPage } from '@/pages/TestimonialsPage';
import { ContactPage } from '@/pages/ContactPage';
import { LegalPage } from '@/pages/LegalPage';
import { ExpressPage } from '@/pages/ExpressPage';
import { BookingPage } from '@/pages/BookingPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminEditorialPage } from '@/pages/admin/AdminEditorialPage';
import { AdminSessionsPage } from '@/pages/admin/AdminSessionsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminSensitivePage } from '@/pages/admin/AdminSensitivePage';
import { AdminFeedbacksPage } from '@/pages/admin/AdminFeedbacksPage';
import { AdminBlogPage } from '@/pages/admin/AdminBlogPage';
import { AdminCommentsPage } from '@/pages/admin/AdminCommentsPage';
import { AdminDonationsPage } from '@/pages/admin/AdminDonationsPage';
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
import { BlogPage, BlogArticlePage } from '@/pages/BlogPage';
import { DonatePage } from '@/pages/DonatePage';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { path } = useRouter();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  // Admin routes
  if (path.startsWith('/admin')) {
    if (!session) return <AdminLoginPage />;
    return (
      <AdminLayout>
        {path === '/admin' && <AdminDashboardPage />}
        {path === '/admin/messages' && <AdminMessagesPage />}
        {path === '/admin/editorial' && <AdminEditorialPage />}
        {path === '/admin/seances' && <AdminSessionsPage />}
        {path === '/admin/paiements' && <AdminPaymentsPage />}
        {path === '/admin/situations' && <AdminSensitivePage />}
        {path === '/admin/avis' && <AdminFeedbacksPage />}
        {path === '/admin/blog' && <AdminBlogPage />}
        {path === '/admin/commentaires' && <AdminCommentsPage />}
        {path === '/admin/dons' && <AdminDonationsPage />}
        {path === '/admin/notifications' && <AdminNotificationsPage />}
      </AdminLayout>
    );
  }

  // Public routes
  return (
    <PublicLayout>
      {path === '/' && <HomePage />}
      {path === '/about' && <AboutPage />}
      {path === '/histoires-partagees' && <TestimonialsPage />}
      {path === '/contact' && <ContactPage />}
      {path === '/mentions-legales' && <LegalPage />}
      {path === '/exprimer' && <ExpressPage />}
      {path === '/reserver' && <BookingPage />}
      {path === '/blog' && <BlogPage />}
      {path.startsWith('/blog/') && <BlogArticlePage slug={path.replace('/blog/', '')} />}
      {path === '/soutenir' && <DonatePage />}
      {path !== '/' &&
        path !== '/about' &&
        path !== '/histoires-partagees' &&
        path !== '/contact' &&
        path !== '/mentions-legales' &&
        path !== '/exprimer' &&
        path !== '/reserver' &&
        path !== '/blog' &&
        !path.startsWith('/blog/') &&
        path !== '/soutenir' && <NotFound />}
    </PublicLayout>
  );
}

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-6xl font-semibold text-teal-600">404</p>
      <p className="mt-4 text-stone-600">Cette page n'existe pas.</p>
      <a href="#/" className="btn-primary mt-6">Retour à l'accueil</a>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
}
