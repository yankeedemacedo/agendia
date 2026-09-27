import { Routes, Route } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { RequireAuth, RequireOrganizer } from "./components/Guards";
import { Home } from "./pages/Home";
import { EventDetails } from "./pages/EventDetails";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { MyEvents } from "./pages/MyEvents";
import { TicketPage } from "./pages/TicketPage";
import { Profile } from "./pages/Profile";
import { AdminEvents } from "./pages/AdminEvents";
import { Attendees } from "./pages/Attendees";
import { DashboardPage } from "./pages/Dashboard";
import { AdminEventForm } from "./pages/AdminEventForm";

export function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eventos/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route
          path="/meus-eventos"
          element={
            <RequireAuth>
              <MyEvents />
            </RequireAuth>
          }
        />
        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireOrganizer>
              <DashboardPage />
            </RequireOrganizer>
          }
        />
        <Route
          path="/admin/eventos"
          element={
            <RequireOrganizer>
              <AdminEvents />
            </RequireOrganizer>
          }
        />
        <Route
          path="/meus-eventos/:id/ingresso"
          element={
            <RequireAuth>
              <TicketPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/eventos/:id/presenca"
          element={
            <RequireOrganizer>
              <Attendees />
            </RequireOrganizer>
          }
        />
        <Route
          path="/admin/eventos/novo"
          element={
            <RequireOrganizer>
              <AdminEventForm />
            </RequireOrganizer>
          }
        />
        <Route
          path="/admin/eventos/:id"
          element={
            <RequireOrganizer>
              <AdminEventForm />
            </RequireOrganizer>
          }
        />
      </Routes>
    </>
  );
}
