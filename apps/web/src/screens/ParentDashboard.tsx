import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi, authApi } from '../api/client';
import { useGameStore } from '../stores/gameStore';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { parentToken } = useGameStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: authApi.getChildren,
    enabled: !!parentToken,
    onSuccess: (data: any[]) => { if (data.length > 0 && !selectedChildId) setSelectedChildId(data[0].id); },
  } as any);

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', selectedChildId],
    queryFn: () => dashboardApi.get(selectedChildId!),
    enabled: !!selectedChildId && !!parentToken,
  });

  if (!parentToken) {
    navigate('/');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100dvh', background: 'var(--color-bg-lobby)', padding: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', fontSize: 24 }}>→</button>
        <h2 style={{ fontSize: 28 }}>{t('parent.dashboard')}</h2>
      </div>

      {/* Child selector */}
      <select
        value={selectedChildId ?? ''}
        onChange={(e) => setSelectedChildId(e.target.value)}
        style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-secondary)', fontSize: 18,
          fontFamily: 'Nunito', marginBottom: 32, width: '100%', maxWidth: 300,
        }}
      >
        {children.map((c: any) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {dashboard && (
        <>
          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'מטבעות', value: `🪙 ${dashboard.totalCoins}` },
              { label: 'שלב נוכחי', value: dashboard.currentLevel },
              { label: `${t('parent.weeklyTime')} (${t('parent.minutes')})`, value: dashboard.weeklyMinutes },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
                padding: '20px 24px', boxShadow: 'var(--shadow-card)', minWidth: 140, textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress chart */}
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ marginBottom: 16 }}>{t('parent.progressChart')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dashboard.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="correctAnswers" stroke="#4ECDC4" strokeWidth={2} dot={false} name="תשובות נכונות" />
                <Line type="monotone" dataKey="totalAnswers" stroke="#FF6B35" strokeWidth={2} dot={false} name="סה״כ" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Error rate chart */}
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ marginBottom: 16 }}>{t('parent.errorChart')}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dashboard.topicErrorRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <Bar dataKey="errorRate" fill="#FF9A9A" radius={[4, 4, 0, 0]} name="שיעור שגיאות" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weak areas */}
          {dashboard.weakAreas.length > 0 && (
            <div style={{ background: 'rgba(255,154,154,0.15)', borderRadius: 'var(--radius-lg)', padding: '16px 24px' }}>
              <strong>{t('parent.weakAreas')}:</strong>{' '}
              {dashboard.weakAreas.join(', ')}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
