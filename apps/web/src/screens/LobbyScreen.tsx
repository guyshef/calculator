import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../stores/gameStore';
import { authApi } from '../api/client';
import ParentLoginModal from '../components/ParentLoginModal';

export default function LobbyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveChild, parentToken } = useGameStore();
  const [showParentLogin, setShowParentLogin] = useState(false);

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: authApi.getChildren,
    enabled: !!parentToken,
  });

  const handleSelectChild = (child: { id: string; name: string; avatar: string; coins: number; currentLevel: number }) => {
    setActiveChild({ ...child, avatar: child.avatar as any, token: '' });
    navigate('/map');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100dvh', background: 'var(--color-bg-lobby)', padding: '32px 24px' }}
    >
      <h1 style={{ textAlign: 'center', fontSize: 40, color: 'var(--color-primary)', marginBottom: 32 }}>
        {t('lobby.title')}
      </h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {children.map((child: any) => (
          <motion.button
            key={child.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectChild(child)}
            style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 20px',
              width: 160,
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              border: '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 56 }}>
              {child.avatar === 'cat-1' ? '🐱' : child.avatar === 'cat-2' ? '😸' : child.avatar === 'hero-1' ? '🦸' : '🦸‍♀️'}
            </span>
            <span style={{ fontFamily: 'Fredoka One', fontSize: 20 }}>{child.name}</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>🪙 {child.coins}</span>
          </motion.button>
        ))}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/avatar')}
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 20px',
            width: 160,
            boxShadow: 'var(--shadow-card)',
            border: '3px dashed var(--color-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--color-secondary-dark)',
            fontSize: 20,
          }}
        >
          <span style={{ fontSize: 40 }}>＋</span>
          <span style={{ fontFamily: 'Fredoka One' }}>{t('lobby.addChild')}</span>
        </motion.button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-ghost" onClick={() => setShowParentLogin(true)}>
          {t('lobby.parentArea')}
        </button>
      </div>

      {showParentLogin && <ParentLoginModal onClose={() => setShowParentLogin(false)} />}
    </motion.div>
  );
}
