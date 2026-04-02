import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useGameStore } from '../stores/gameStore';

interface Props { onClose: () => void; }

export default function ParentLoginModal({ onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setParentToken } = useGameStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { accessToken } = await authApi.loginParent(email, password);
      setParentToken(accessToken);
      onClose();
      navigate('/parent');
    } catch {
      setError('אימייל או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      aria-modal="true"
      aria-label="כניסה לאזור הורים"
      role="dialog"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          padding: 32, width: '90%', maxWidth: 360,
          boxShadow: 'var(--shadow-modal)', display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <h3 id="parent-modal-title" style={{ fontSize: 24, textAlign: 'center' }}>{t('parent.title')}</h3>

        {['email', 'password'].map((field) => (
          <input
            key={field}
            type={field}
            placeholder={t(`parent.${field}`)}
            value={field === 'email' ? email : password}
            onChange={(e) => field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)}
            style={{
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-secondary)', fontSize: 18,
              fontFamily: 'Nunito', direction: 'ltr', textAlign: 'right',
            }}
          />
        ))}

        {error && <p style={{ color: 'var(--color-error)', textAlign: 'center', fontSize: 16 }}>{error}</p>}

        <button className="btn-primary" onClick={handleLogin} disabled={loading || !email || !password}>
          {loading ? '...' : t('parent.login')}
        </button>

        <button
          style={{ background: 'none', color: 'var(--color-text-secondary)', fontSize: 16, textAlign: 'center' }}
        >
          {t('parent.forgot')}
        </button>
      </motion.div>
    </motion.div>
  );
}
