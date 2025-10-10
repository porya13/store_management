import React, { useMemo } from 'react'
import { useLocation, matchPath,useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/logoo.png'
import { Home, House, LogOut } from 'lucide-react'



export default function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const handleLogout = () => {
        logout()
        navigate('/login')
    }
  const location = useLocation()

  const title = useMemo(() => {
    const pathname = location.pathname || '/'

    const routes = [
      { pattern: '/home', title: 'خانه' },
      { pattern: '/carpets/:id', title: 'جزئیات فرش' },
      { pattern: '/carpets', title: 'فرش‌ها' },
      { pattern: '/invoices', title: 'فاکتورها' },
      { pattern: '/checks', title: 'چک‌ها' },
      { pattern: '/reports', title: 'گزارشات' },
      { pattern: '/login', title: 'ورود' },
      { pattern: '/register', title: 'ثبت‌نام' },
    ]

    for (const r of routes) {
      if (matchPath({ path: r.pattern, end: true }, pathname)) return r.title
    }

    return 'مدیریت فروشگاه فرش'
  }, [location.pathname])

  return (
    <header className="header">
      <div className="p-3 flex items-center justify-between">
        <div className='flex items-center gap-2 md:gap-5'>
          <button 
            onClick={handleLogout} 
            className="text-white px-3 py-2 rounded-xl hover:bg-neutral-600 bg-neutral-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button 
            onClick={()=>{navigate('/home')}} 
            className="hidden md:flex text-white px-4 py-2 rounded-xl hover:bg-neutral-600 bg-neutral-400 transition-all"
          >
            <House className="w-5 h-5" />
          </button>
        </div>
        
        <div className='flex items-center text-white gap-2 md:gap-8'>
          {/* Desktop Navigation */}
          <ul className='hidden md:flex items-center gap-x-6 text-lg' dir='rtl'>
            <Link to='/carpets' className='nav'>فرش ها</Link>
            <Link to='/invoices' className='nav'>فاکتورها</Link>
            <Link to='/checks' className='nav'>چک‌ها</Link>
            <Link to='/reports' className='nav'>گزارشات</Link>
          </ul>
          
          {/* Mobile Title */}
          <h2 className='md:hidden text-sm font-medium'>سامانه مدیریت</h2>
          
          {/* Logo */}
          <img src={Logo} alt="Logo" className='h-6 md:h-7'/>
        </div>
      </div>
    </header>
  )
}


