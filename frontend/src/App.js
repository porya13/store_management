import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/home'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import BottomNavigation from './components/BottomNavigation'
import CarpetsList from './pages/CarpetsList'
import CarpetDetail from './pages/CarpetDetail'
import Invoices from './pages/Invoices'
import Checks from './pages/Checks'
import Reports from './pages/Reports'
import Register from './pages/Register'
import CarpetForm from './components/carpetform'
import InvoiceForm from './pages/InvoiceForm'
import InvoiceDetail from './pages/InvoiceDetail'
import ProfileSettings from './pages/ProfileSettings'
import Profile from './pages/profile'
import UserManagement from './pages/usermanagement'
function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/carpets" element={<CarpetsList />} />
              <Route path="/carpets/add" element={<CarpetForm />} />
              <Route path="/carpets/edit/:id" element={<CarpetForm />} />
              <Route path="/carpets/:id" element={<CarpetDetail />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/checks" element={<Checks />} />
              <Route path="/reports" element={<Reports />} />
              <Route path='/InvoiceForm' element={<InvoiceForm/>}/>
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
            
              <Route path="/profile" element={<Profile />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <BottomNavigation />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
