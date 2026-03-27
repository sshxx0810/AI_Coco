import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainPage from './pages'
import GenImages from './pages/home/components/gen_images'
import ChatFrame from './pages/home/components/chatFrame'
import ImagePanel from './pages/home/components/gen_images/image_panel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<MainPage />}>
          <Route path="*" element={<ChatFrame />} />
          <Route path="chat" element={<ChatFrame />} />
          <Route path="image" element={<GenImages />} />
          <Route path="imagepanel" element={<ImagePanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
