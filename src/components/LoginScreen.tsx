import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  LogIn,
  ShieldAlert,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye as EyeIcon,
} from 'lucide-react';
import { User } from '../types';
import { authenticateUser } from '../auth/authService';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { MedievalDivider } from './MedievalDivider';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onEnterAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onEnterAsGuest,
}) => {
  const { isParchment } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authenticateUser(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch {
      setErrorMessage('Ocorreu um erro ao processar o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (userDemo: string, passDemo: string) => {
    setIdentifier(userDemo);
    setPassword(passDemo);
    setErrorMessage(null);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-center items-center p-4 pt-12 sm:pt-4 relative overflow-hidden font-sans transition-colors duration-300 ${
        isParchment ? 'parchment-wood-bg' : 'bg-slate-950'
      }`}
    >
      {/* Top-Right Theme Switcher Button */}
      <ThemeToggle isFloating={true} />

      {/* Dynamic Background Glows */}
      {isParchment ? (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Main Card Container */}
      <div className="w-full max-w-[440px] relative z-10">
        {/* Guild Logo & Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative group">
            {isParchment ? (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#24150b] border-4 border-[#c5994f] shadow-[0_0_25px_rgba(197,153,79,0.5)] p-1.5 flex items-center justify-center">
                <img
                  src="/guild_logo.png"
                  alt="Hear Me Roar Guild Logo"
                  className="w-full h-full object-contain drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/guild_logo.jpg';
                  }}
                />
              </div>
            ) : (
              <>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 border-2 border-amber-500/60 shadow-2xl p-1.5 flex items-center justify-center">
                  <img
                    src="/guild_logo.png"
                    alt="Hear Me Roar Guild Logo"
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/guild_logo.jpg';
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <h1
            className={`mt-4 text-2xl sm:text-3xl font-black uppercase tracking-wider drop-shadow-sm ${
              isParchment
                ? 'font-medieval text-[#f8ebd0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400'
            }`}
          >
            HEAR ME ROAR
          </h1>
          <p
            className={`text-xs sm:text-sm font-semibold tracking-widest uppercase mt-0.5 ${
              isParchment ? 'text-[#d8af65] font-medieval' : 'text-amber-400/90'
            }`}
          >
            Gaming Guild · Raide 40
          </p>
          <p className={`text-xs mt-1 ${isParchment ? 'text-[#d5bba0]' : 'text-slate-400'}`}>
            Sistema Tático de Gerenciamento & Escalação
          </p>
        </div>

        {/* Login Form Box (Parchment scroll or Slate modern) */}
        <div
          className={`rounded-2xl p-6 sm:p-7 shadow-2xl transition-all ${
            isParchment
              ? 'parchment-surface border-2 border-[#8b5a2b] shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-[#361e0b]'
              : 'bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-black/80 text-slate-100'
          }`}
        >
          {/* Scroll roll detail in parchment mode */}
          {isParchment && (
            <div className="parchment-scroll-roll h-2 w-full rounded-t-lg -mt-4 mb-4" />
          )}

          <div
            className={`mb-5 pb-3 border-b flex items-center justify-between ${
              isParchment ? 'border-[#a87d46]/50' : 'border-slate-800'
            }`}
          >
            <span
              className={`text-sm font-bold flex items-center gap-2 ${
                isParchment ? 'font-medieval text-[#3d220c] font-black' : 'text-slate-200'
              }`}
            >
              <Lock size={15} className={isParchment ? 'text-[#8b5a2b]' : 'text-amber-400'} />
              Autenticação de Acesso
            </span>
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                isParchment
                  ? 'bg-[#ecd19f] text-[#4e2b0e] border-[#b0874e]'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              v2.5
            </span>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isParchment
                  ? 'bg-rose-900/20 border-rose-700 text-rose-900 font-medium'
                  : 'bg-rose-950/70 border-rose-800/80 text-rose-200'
              }`}
            >
              <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Falha no Acesso</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário ou E-mail */}
            <div>
              <label
                htmlFor="login-identifier"
                className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isParchment ? 'text-[#503013] font-medieval' : 'text-slate-300'
                }`}
              >
                Usuário ou E-mail
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isParchment ? 'text-[#8a5f2e]' : 'text-slate-500'
                  }`}
                >
                  <UserIcon size={16} />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: admin ou viewer"
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border-2 border-[#b88c52] text-[#341b08] placeholder-[#9c7849] focus:border-[#7a481c] focus:ring-2 focus:ring-[#8f5a28]/30 shadow-inner'
                      : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className={`block text-xs font-bold uppercase tracking-wider ${
                    isParchment ? 'text-[#503013] font-medieval' : 'text-slate-300'
                  }`}
                >
                  Senha
                </label>
              </div>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isParchment ? 'text-[#8a5f2e]' : 'text-slate-500'
                  }`}
                >
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border-2 border-[#b88c52] text-[#341b08] placeholder-[#9c7849] focus:border-[#7a481c] focus:ring-2 focus:ring-[#8f5a28]/30 shadow-inner'
                      : 'bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors cursor-pointer ${
                    isParchment ? 'text-[#8a5f2e] hover:text-[#42240b]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 font-bold text-sm rounded-xl shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                isParchment
                  ? 'bg-gradient-to-r from-[#6e3b15] via-[#8f5322] to-[#6e3b15] hover:brightness-110 text-[#fff8ed] border-2 border-[#c5994f] shadow-[0_4px_14px_rgba(0,0,0,0.5)] font-medieval tracking-wider'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-orange-950/50 border border-amber-400/30'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          {isParchment ? (
            <MedievalDivider variant="standard" className="my-4" />
          ) : (
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">ou</span>
              </div>
            </div>
          )}

          {/* Link / Botão Discreto: Acessar somente para visualização */}
          <div className="text-center">
            <button
              type="button"
              id="btn-login-guest"
              onClick={onEnterAsGuest}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer group ${
                isParchment
                  ? 'bg-[#faeed6] hover:bg-[#fae5c3] border-2 border-[#a87d46] text-[#41240c] font-medieval shadow-xs'
                  : 'border border-slate-700/80 hover:border-slate-600 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Acessar o painel diretamente sem efetuar login (permissão somente para visualização)"
            >
              <EyeIcon
                size={15}
                className={isParchment ? 'text-[#8b5a2b] group-hover:scale-110 transition-transform' : 'text-sky-400 group-hover:scale-110 transition-transform'}
              />
              <span>Acessar somente para visualização</span>
              <ArrowRight
                size={13}
                className={isParchment ? 'text-[#8b5a2b] group-hover:translate-x-0.5 transition-transform' : 'text-slate-500 group-hover:translate-x-0.5 transition-transform'}
              />
            </button>
            <p className={`text-[11px] mt-1.5 ${isParchment ? 'text-[#6e461f]' : 'text-slate-400'}`}>
              Entrar como visitante · Não requer usuário ou senha
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs ${
            isParchment
              ? 'parchment-card border border-[#8e612f] text-[#47270d]'
              : 'bg-slate-900/60 border border-slate-800/80 text-slate-400'
          }`}
        >
          <span
            className={`font-bold block mb-2 text-center text-[11px] uppercase tracking-wider ${
              isParchment ? 'text-[#3d220c] font-medieval' : 'text-slate-300'
            }`}
          >
            Credenciais Pré-Configuradas para Testes:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin', 'admin')}
              className={`p-2 rounded-lg text-left transition-all cursor-pointer group ${
                isParchment
                  ? 'bg-[#faeed6] hover:bg-[#fae3bc] border border-[#a87d46]'
                  : 'bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50'
              }`}
              title="Clique para preencher os dados de Administrador"
            >
              <div
                className={`flex items-center gap-1 font-bold text-[11px] ${
                  isParchment ? 'text-[#7a4214]' : 'text-amber-400'
                }`}
              >
                <ShieldCheck size={12} />
                <span>Administrador</span>
              </div>
              <div
                className={`text-[10.5px] font-mono mt-0.5 ${
                  isParchment ? 'text-[#503013]' : 'text-slate-400'
                }`}
              >
                user: <strong>admin</strong> · pass: <strong>admin</strong>
              </div>
              <span
                className={`text-[10px] font-medium block mt-0.5 ${
                  isParchment ? 'text-emerald-800 font-bold' : 'text-emerald-400'
                }`}
              >
                Edição completa
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('viewer', 'viewer')}
              className={`p-2 rounded-lg text-left transition-all cursor-pointer group ${
                isParchment
                  ? 'bg-[#faeed6] hover:bg-[#fae3bc] border border-[#a87d46]'
                  : 'bg-slate-950 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50'
              }`}
              title="Clique para preencher os dados de Visualizador"
            >
              <div
                className={`flex items-center gap-1 font-bold text-[11px] ${
                  isParchment ? 'text-[#20527e]' : 'text-sky-400'
                }`}
              >
                <EyeIcon size={12} />
                <span>Visualizador</span>
              </div>
              <div
                className={`text-[10.5px] font-mono mt-0.5 ${
                  isParchment ? 'text-[#503013]' : 'text-slate-400'
                }`}
              >
                user: <strong>viewer</strong> · pass: <strong>viewer</strong>
              </div>
              <span
                className={`text-[10px] font-medium block mt-0.5 ${
                  isParchment ? 'text-sky-800 font-bold' : 'text-sky-400'
                }`}
              >
                Somente leitura
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className={`text-center text-[11px] mt-4 ${isParchment ? 'text-[#caa885]' : 'text-slate-400'}`}>
          Guilda Hear Me Roar © 2026 · Organização de Raide 40 Pessoas
        </p>
      </div>
    </div>
  );
};

