import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coinsEarned = 0, level = 1 } = (location.state as any) ?? {};

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #FFF9F0 0%, #FFE0D0 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: 32,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8 }}
        style={{ fontSize: 80 }}
      >
        🎉
      </motion.div>

      <h1 style={{ fontSize: 40, color: 'var(--color-primary)', textAlign: 'center' }}>
        כל הכבוד!
      </h1>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22, marginBottom: 8 }}>הרווחת</p>
        <motion.p
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-primary)' }}
        >
          🪙 {coinsEarned}
        </motion.p>
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 8, fontSize: 40 }}>
        {[1, 2, 3].map((star) => (
          <motion.span
            key={star}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 * star, type: 'spring', stiffness: 200 }}
          >
            ⭐
          </motion.span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-ghost" onClick={() => navigate(`/exercise/${level}`)}>
          שחק שוב
        </button>
        <button className="btn-primary" onClick={() => navigate('/map')}>
          שלב הבא ▶
        </button>
      </div>
    </motion.div>
  );
}
