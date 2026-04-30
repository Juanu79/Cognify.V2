import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import LogoP from "../assets/LogoP.png";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;

  const listener = App.addListener('appUrlOpen', async ({ url }) => {
    if (url.includes('auth/callback')) {
      await Browser.close();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard');
    }
  });

  return () => { listener.then(l => l.remove()); };
}, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError("Error: " + error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

const loginGoogle = async () => {
  const isNative = Capacitor.isNativePlatform();
  const redirectTo = isNative
    ? 'com.cognify.app://auth/callback'
    : window.location.origin + '/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: isNative }
  });
  if (error) { console.error(error); return; }
  if (isNative && data?.url) await Browser.open({ url: data.url });
};

const loginGithub = async () => {
  const isNative = Capacitor.isNativePlatform();
  const redirectTo = isNative
    ? 'com.cognify.app://auth/callback'
    : window.location.origin + '/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo, skipBrowserRedirect: isNative }
  });
  if (error) { console.error(error); return; }
  if (isNative && data?.url) await Browser.open({ url: data.url });
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-wrapper {
          display: flex;
          height: 100vh;
          font-family: 'Poppins', sans-serif;
          background: #f0f4ff;
        }

        .reg-left {
          width: 50%;
          background: linear-gradient(160deg, #fff 55%, #ede9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .form-box { width: 100%; max-width: 420px; }
        .form-welcome { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
        .form-sub { font-size: 0.88rem; color: #888; margin-bottom: 36px; }
        .field-label { font-size: 0.82rem; font-weight: 600; color: #333; margin-bottom: 8px; display: block; }

        .input-wrapper { position: relative; margin-bottom: 22px; }
        .input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #aaa;
          display: flex; align-items: center;
        }
        .styled-input {
          width: 100%; padding: 14px 44px 14px 44px;
          border: none; border-bottom: 2px solid #d0d0e0;
          background: #f4f2ff; border-radius: 10px 10px 0 0;
          font-size: 0.93rem; font-family: 'Poppins', sans-serif;
          color: #222; outline: none; transition: border-color 0.25s;
        }
        .styled-input:focus { border-bottom-color: #5b21f5; }
        .styled-input::placeholder { color: #bbb; }

        .toggle-pw {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #aaa;
          display: flex; align-items: center; padding: 0;
        }

        .error-box { background: #ffe5e5; color: #b91c1c; padding: 10px 14px; border-radius: 8px; margin-bottom: 18px; font-size: 0.85rem; }
        .success-box { background: #e6f9f0; color: #065f46; padding: 12px 16px; border-radius: 10px; margin-bottom: 18px; font-size: 0.88rem; border-left: 4px solid #10b981; }

        .btn-row { display: flex; gap: 14px; margin-top: 10px; align-items: center; }
        .btn-register {
          flex: 1; padding: 14px 20px; border-radius: 50px; border: none;
          background: linear-gradient(135deg, #6c63ff, #3b1ff5);
          color: #fff; font-size: 0.95rem; font-weight: 700;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: opacity 0.2s, transform 0.15s;
        }
        .btn-register:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-login {
          flex: 1; padding: 14px 20px; border-radius: 50px;
          border: 1.5px solid #ddd; background: transparent;
          color: #aaa; font-size: 0.95rem; font-weight: 600;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; transition: border-color 0.2s, color 0.2s;
        }
        .btn-login:hover { border-color: #5b21f5; color: #5b21f5; }

        .divider-row {
          display: flex; align-items: center; gap: 12px;
          margin: 28px 0 16px; color: #bbb; font-size: 0.8rem;
        }
        .divider-row::before, .divider-row::after {
          content: ''; flex: 1; height: 1px; background: #e5e5ee;
        }

        .social-row { display: flex; gap: 12px; }
        .social-btn {
          flex: 1; padding: 11px; border-radius: 10px;
          border: 1px solid #e0e0f0; background: #fff; cursor: pointer;
          font-size: 0.85rem; font-family: 'Poppins', sans-serif;
          font-weight: 600; color: #444; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .social-btn:hover { border-color: #5b21f5; box-shadow: 0 2px 8px rgba(91,33,245,0.12); }

        .footer-text { margin-top: 24px; text-align: center; font-size: 0.85rem; color: #888; }
        .footer-text a { color: #5b21f5; font-weight: 600; text-decoration: none; }
        .footer-text a:hover { text-decoration: underline; }

        .reg-right {
          width: 50%;
          background: linear-gradient(145deg, #3b1ff5 0%, #5b35ff 35%, #2563eb 80%, #1d4ed8 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; color: #fff;
        }

        .rblob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.22; pointer-events: none; }
        .rblob1 { width: 320px; height: 320px; background: #a78bfa; top: -90px; right: -80px; }
        .rblob2 { width: 240px; height: 240px; background: #60a5fa; bottom: -60px; left: -40px; }
        .rblob3 { width: 160px; height: 160px; background: #fff; top: 50%; left: 50%; transform: translate(-50%,-50%); }

        .rcircle { position: absolute; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); pointer-events: none; }
        .rc1 { width: 240px; height: 240px; top: -70px; left: -70px; }
        .rc2 { width: 150px; height: 150px; top: 30px; left: 80px; }
        .rc3 { width: 200px; height: 200px; bottom: -60px; right: -60px; }
        .rc4 { width: 100px; height: 100px; bottom: 80px; right: 80px; }

        .right-logo-box {
          width: 100px; height: 100px;
          background: rgba(255,255,255,0.15);
          border-radius: 22px; display: flex;
          align-items: center; justify-content: center;
          margin-bottom: 28px; backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.28);
          position: relative; z-index: 1;
        }

        .right-title { font-size: 2.2rem; font-weight: 800; text-align: center; line-height: 1.2; margin-bottom: 16px; position: relative; z-index: 1; }
        .right-subtitle { font-size: 0.9rem; text-align: center; opacity: 0.82; line-height: 1.6; max-width: 280px; position: relative; z-index: 1; }

        .right-footer {
          position: absolute; bottom: 28px;
          display: flex; gap: 24px; align-items: center; z-index: 1;
        }
        .right-footer a { color: rgba(255,255,255,0.82); text-decoration: none; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .right-footer .sep { color: rgba(255,255,255,0.35); font-size: 1rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .reg-wrapper { flex-direction: column; height: auto; min-height: 100vh; }
          .reg-right { display: none; }
          .reg-left {
            width: 100%;
            min-height: 100vh;
            padding: 48px 24px;
            align-items: flex-start;
            padding-top: 60px;
          }
        }
      `}</style>

      <div className="reg-wrapper">

        <div className="reg-left">
          <div className="form-box">
            <h2 className="form-welcome">Crear cuenta</h2>
            <p className="form-sub">Regístrate para empezar a aprender</p>

            {error   && <div className="error-box">⚠ {error}</div>}
            {success && <div className="success-box">✅ Cuenta creada. Revisa tu correo para confirmar.</div>}

            <form onSubmit={handleRegister}>
              <label className="field-label">Correo Electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 7 10-7"/>
                  </svg>
                </span>
                <input className="styled-input" type="email" placeholder="Ingresa tu correo" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <label className="field-label">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input className="styled-input" type={showPassword ? "text" : "password"} placeholder="Crea tu contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div className="btn-row">
                <button type="submit" className="btn-register" disabled={loading}>
                  {loading ? "Creando..." : "Registrarse"} →
                </button>
                <Link to="/" className="btn-login">Iniciar sesión</Link>
              </div>
            </form>

            <div className="divider-row">O continúa con</div>

            <div className="social-row">
              <button className="social-btn" onClick={loginGoogle}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.16 7.09-10.29 7.09-17.65z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.53 28.58A14.9 14.9 0 0 1 9.5 24c0-1.58.27-3.12.75-4.58l-7.98-6.16A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.27 10.74l8.26-6.16z"/>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.27 13.26l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
                </svg>
                Google
              </button>
              <button className="social-btn" onClick={loginGithub}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            <p className="footer-text">
              ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
            </p>
          </div>
        </div>

        <div className="reg-right">
          <div className="rblob rblob1" />
          <div className="rblob rblob2" />
          <div className="rblob rblob3" />
          <div className="rcircle rc1" />
          <div className="rcircle rc2" />
          <div className="rcircle rc3" />
          <div className="rcircle rc4" />

          <div className="right-logo-box">
            <img src={LogoP} alt="Cognify Logo" style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '12px' }} />
          </div>

          <h1 className="right-title">Únete a<br />Cognify</h1>
          <p className="right-subtitle">Comienza tu viaje de aprendizaje hoy. Miles de lecciones te esperan. 🧠✨</p>

          <div className="right-footer">
            <Link to="/">INICIAR SESIÓN</Link>
            <span className="sep">|</span>
            <Link to="/">DESCUBRIR MÁS</Link>
          </div>
        </div>

      </div>
    </>
  );
}