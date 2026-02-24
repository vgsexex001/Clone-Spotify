import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SignupModal() {
  const { signup, showSignup, setShowSignup, setShowLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showSignup) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, username, password);
      toast.success('Conta criada com sucesso!');
    } catch (err) {
      setError(err.message || 'Falha na inscrição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-sp-surface rounded-lg p-8 w-full max-w-[400px] relative">
        <button
          onClick={() => setShowSignup(false)}
          className="absolute top-4 right-4 text-sp-text-sub hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-6">Inscreva-se grátis</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-white mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-sp-tinted text-white px-4 py-3 rounded text-sm outline-none focus:ring-2 focus:ring-white/30 placeholder:text-sp-text-sub"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-white mb-1 block">Nome de usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-sp-tinted text-white px-4 py-3 rounded text-sm outline-none focus:ring-2 focus:ring-white/30 placeholder:text-sp-text-sub"
              placeholder="Como quer ser chamado?"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-white mb-1 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-sp-tinted text-white px-4 py-3 rounded text-sm outline-none focus:ring-2 focus:ring-white/30 placeholder:text-sp-text-sub"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sp-green hover:bg-sp-green-light text-black font-bold py-3 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Inscrever-se'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sp-text-sub text-sm">Já tem uma conta? </span>
          <button
            onClick={() => { setShowSignup(false); setShowLogin(true); }}
            className="text-white text-sm font-semibold hover:underline cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
