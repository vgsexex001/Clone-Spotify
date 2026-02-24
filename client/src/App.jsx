import { BrowserRouter, Routes, Route, useOutletContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AudioProvider } from './contexts/AudioContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import SearchPage from './components/pages/SearchPage';
import ArtistPage from './components/pages/ArtistPage';
import AlbumPage from './components/pages/AlbumPage';
import PlaylistPage from './components/pages/PlaylistPage';
import LikedSongsPage from './components/pages/LikedSongsPage';
import LoginModal from './components/auth/LoginModal';
import SignupModal from './components/auth/SignupModal';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function HomeWrapper() {
  const { isCompact } = useOutletContext();
  return <HomePage isCompact={isCompact} />;
}

function KeyboardShortcuts() {
  useKeyboardShortcuts();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioProvider>
          <PlaylistProvider>
            <KeyboardShortcuts />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#282828',
                  color: '#fff',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#1DB954', secondary: '#000' } },
              }}
            />
            <LoginModal />
            <SignupModal />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomeWrapper />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/artist/:source/:id" element={<ArtistPage />} />
                <Route path="/album/:source/:id" element={<AlbumPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/liked" element={<LikedSongsPage />} />
              </Route>
            </Routes>
          </PlaylistProvider>
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
