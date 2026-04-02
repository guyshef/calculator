import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AvatarType } from '@calculator/types';
import { useGameStore } from '../stores/gameStore';

const AVATARS: { type: AvatarType; emoji: string; label: string }[] = [
  { type: AvatarType.CAT_1, emoji: '🐱', label: 'חתול כחול' },
  { type: AvatarType.CAT_2, emoji: '😸', label: 'חתול כתום' },
  { type: AvatarType.HERO_1, emoji: '🦸', label: 'גיבור על ירוק' },
  { type: AvatarType.HERO_2, emoji: '🦸‍♀️', label: 'גיבור על סגול' },
];

export default function AvatarScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveChild } = useGameStore();
  const [selected, setSelected] = useState<AvatarType | null>(null);
  const [name, setName] = useState('');

  const canStart = selected !== null && name.trim().length >= 2;

  const handleStart = () => {
    if (!canStart) return;
    setActiveChild({ id: 'new', name: name.trim(), avatar: selected!, coins: 0, currentLevel: 1, token: '' });
    navigate('/map');
  };

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      style={{ minHeight: '100dvh', background: 'var(--color-bg-lobby)', padding: '32px 24px' }}
    >
      <button onClick={() => navigate('/')} style={{ background: 'none', fontSize: 24, marginBottom: 16 }}>→</button>

      <h2 style={{ textAlign: 'center', fontSize: 32, marginBottom: 32 }}>
        {t('avatarSelect.title')}
      </h2>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {AVATARS.map((a) => (
          <motion.button
            key={a.type}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelected(a.type)}
            style={{
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 16px',
              width: 140,
              border: selected === a.type
                ? '4px solid var(--color-primary)'
                : '4px solid transparent',
              boxShadow: selected === a.type ? 'var(--shadow-tile)' : 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          >
            <span style={{ fontSize: 52 }}>{a.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{a.label}</span>
          </motion.button>
        ))}
      </div>

      <div style={{ maxWidth: 320, margin: '0 auto 32px', textAlign: 'center' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('avatarSelect.namePlaceholder')}
          maxLength={20}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-secondary)',
            fontSize: 20,
            fontFamily: 'Nunito',
            textAlign: 'center',
            direction: 'rtl',
          }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={handleStart} disabled={!canStart}>
          {t('avatarSelect.start')}
        </button>
      </div>
    </motion.div>
  );
}
