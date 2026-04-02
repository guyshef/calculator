import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useTranslation } from 'react-i18next';

const TOTAL_LEVELS = 5;

const AVATAR_EMOJIS: Record<string, string> = {
  'cat-1': '🐱', 'cat-2': '😸', 'hero-1': '🦸', 'hero-2': '🦸‍♀️',
};

export default function MapScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeChild, levels, initLevels } = useGameStore();

  useEffect(() => {
    if (!activeChild) { navigate('/'); return; }
    const completed = Array.from({ length: activeChild.currentLevel - 1 }, (_, i) => i + 1);
    initLevels(TOTAL_LEVELS, activeChild.currentLevel, completed);
  }, [activeChild]);

  if (!activeChild) return null;

  const handleNodeTap = (level: number, status: string) => {
    if (status === 'locked') return;
    navigate(`/exercise/${level}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100dvh', background: 'var(--color-bg-lobby)', padding: '24px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 28 }}>
          {AVATAR_EMOJIS[activeChild.avatar] ?? '🐱'} {activeChild.name}
        </span>
        <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--color-primary)' }}>
          🪙 {activeChild.coins}
        </span>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: 40 }}>{t('map.title')}</h2>

      {/* Level nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', maxWidth: 400, margin: '0 auto' }}>
        {[...levels].reverse().map((node) => (
          <motion.button
            key={node.level}
            whileTap={node.status !== 'locked' ? { scale: 0.92 } : {}}
            onClick={() => handleNodeTap(node.level, node.status)}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: 'none',
              fontSize: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: node.status === 'locked' ? 'not-allowed' : 'pointer',
              background:
                node.status === 'completed'
                  ? 'var(--color-primary)'
                  : node.status === 'current'
                    ? 'var(--color-secondary)'
                    : 'var(--color-locked)',
              boxShadow: node.status !== 'locked' ? 'var(--shadow-tile)' : 'none',
              animation: node.status === 'current' ? 'pulse 2s infinite' : 'none',
              color: 'white',
            }}
          >
            {node.status === 'completed' ? '★' : node.status === 'locked' ? '🔒' : node.level}
            <span style={{ fontSize: 12, fontWeight: 700 }}>{t('map.level')} {node.level}</span>
          </motion.button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(78,205,196,0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(78,205,196,0); }
        }
      `}</style>
    </motion.div>
  );
}
