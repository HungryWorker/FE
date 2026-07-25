import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import OAuthCallback from './pages/OAuthCallback'
import Profile from './pages/Profile'
import MapView from './pages/MapView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/map" element={<MapView />} />
    </Routes>
  )
}
