import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageProvider';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { RequireStudent } from './components/guards/RequireStudent';
import { RequireRole } from './components/guards/RequireRole';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Courses = lazy(() => import('./pages/public/Courses'));
const Teachers = lazy(() => import('./pages/public/Teachers'));
const Results = lazy(() => import('./pages/public/Results'));
const Gallery = lazy(() => import('./pages/public/Gallery'));
const Faq = lazy(() => import('./pages/public/Faq'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Admission = lazy(() => import('./pages/public/Admission'));
const AdmissionStatus = lazy(() => import('./pages/public/AdmissionStatus'));
const Foundation = lazy(() => import('./pages/public/Foundation'));
const ComingSoon = lazy(() => import('./pages/public/ComingSoon'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Phase 5: Student / Parent Portal Pages
const Login = lazy(() => import('./pages/portal/Login'));
const PortalLayout = lazy(() => import('./pages/portal/PortalLayout'));
const Dashboard = lazy(() => import('./pages/portal/Dashboard'));
const Fees = lazy(() => import('./pages/portal/Fees'));
const Announcements = lazy(() => import('./pages/portal/Announcements'));
const Profile = lazy(() => import('./pages/portal/Profile'));
const ChangePassword = lazy(() => import('./pages/portal/ChangePassword'));
import AccessDenied from './pages/portal/AccessDenied';


export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Core Public Academy Pages with Public Header & Footer */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="courses" element={<Courses />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="results" element={<Results />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="faq" element={<Faq />} />
              <Route path="contact" element={<Contact />} />

              {/* Admission Flow */}
              <Route path="admission" element={<Admission />} />
              <Route path="admission/status" element={<AdmissionStatus />} />

              {/* Foundation Test Page */}
              <Route path="foundation" element={<Foundation />} />

              {/* Student Portal Authentication Entrance */}
              <Route path="portal/login" element={<Login />} />

              {/* Access Denied Page */}
              <Route path="access-denied" element={<AccessDenied />} />

              {/* Protected Admin Routes: Logged-in students see Access Denied, unauthenticated see ComingSoon */}
              <Route element={<RequireRole allowedRole="admin" />}>
                <Route path="admin" element={<ComingSoon />} />
                <Route path="admin/*" element={<ComingSoon />} />
              </Route>

              {/* 404 Catch-All within Public Layout */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Authenticated Student Portal Routes with Portal Dashboard Layout */}
            <Route element={<RequireStudent />}>
              <Route path="portal" element={<PortalLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="fees" element={<Fees />} />
                <Route path="fees/proof" element={<Fees />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}
