import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DndContext, DragEndEvent, useDroppable, useDraggable } from '@dnd-kit/core';
import { exercisesApi, progressApi } from '../api/client';
import { useGameStore } from '../stores/gameStore';
import type { Exercise } from '@calculator/types';

// ─── Draggable tile ───────────────────────────────────────────────────────────

function NumberTile({ id, value, disabled }: { id: string; value: number; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });
  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      animate={{ scale: isDragging ? 1.12 : 1, rotate: isDragging ? -3 : 0 }}
      style={{
        width: 64, height: 64,
        background: disabled ? 'var(--color-locked)' : 'var(--color-bg-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : 'var(--shadow-tile)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        transform: transform ? `translate(${transform.x}px,${transform.y}px)` : undefined,
        zIndex: isDragging ? 100 : 1,
      }}
    >
      {value}
    </motion.div>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function AnswerSlot({ value, isCorrect, isWrong }: { value: number | null; isCorrect: boolean; isWrong: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'answer-slot' });
  return (
    <div
      ref={setNodeRef}
      style={{
        width: 72, height: 72,
        borderRadius: 'var(--radius-md)',
        border: `3px ${value ? 'solid' : 'dashed'} ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isOver ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
        background: isCorrect ? 'rgba(107,203,119,0.15)' : isWrong ? 'rgba(255,154,154,0.15)' : isOver ? 'rgba(255,107,53,0.08)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 800,
        transition: 'border 0.2s, background 0.2s',
      }}
    >
      {value ?? '?'}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ExerciseScreen() {
  const { t } = useTranslation();
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { activeChild, addCoins, unlockNextLevel, queueSession } = useGameStore();

  const [index, setIndex] = useState(0);
  const [droppedAnswer, setDroppedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [shake, setShake] = useState(false);
  const attemptsRef = useRef<Array<{ exerciseId: string; correct: boolean; answeredAt: string }>>([]);
  const coinsRef = useRef(0);

  const levelNum = parseInt(level ?? '1', 10);

  const { data, isLoading } = useQuery({
    queryKey: ['exercises', levelNum],
    queryFn: () => exercisesApi.getByLevel(levelNum),
  });

  const exercises: Exercise[] = data?.exercises ?? [];
  const current = exercises[index];

  useEffect(() => {
    setDroppedAnswer(null);
    setIsCorrect(false);
    setIsWrong(false);
  }, [index]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.over.id !== 'answer-slot' || !current) return;
    const val = parseInt(event.active.id as string, 10);
    setDroppedAnswer(val);

    const correct = val === current.answer;
    if (correct) {
      setIsCorrect(true);
      coinsRef.current += 1;
      attemptsRef.current.push({ exerciseId: current.id, correct: true, answeredAt: new Date().toISOString() });
      setTimeout(() => {
        if (index + 1 >= exercises.length) {
          finishLevel();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1200);
    } else {
      setIsWrong(true);
      setShake(true);
      attemptsRef.current.push({ exerciseId: current.id, correct: false, answeredAt: new Date().toISOString() });
      setTimeout(() => { setShake(false); setDroppedAnswer(null); setIsWrong(false); }, 800);
    }
  };

  const finishLevel = () => {
    const earned = coinsRef.current;
    addCoins(earned);
    unlockNextLevel();

    const session = {
      childId: activeChild!.id,
      level: levelNum,
      coinsEarned: earned,
      accuracy: attemptsRef.current.filter((a) => a.correct).length / attemptsRef.current.length,
      completedAt: new Date().toISOString(),
      attempts: attemptsRef.current,
    };

    progressApi.save({ ...session, attempts: session.attempts })
      .catch(() => queueSession(session));

    navigate('/results', { state: { coinsEarned: earned, level: levelNum } });
  };

  if (isLoading || !current) {
    return <div style={{ textAlign: 'center', padding: 40 }}>טוען תרגילים...</div>;
  }

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      style={{ minHeight: '100dvh', background: 'var(--color-bg-exercise)', padding: 24 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => navigate('/map')} style={{ background: 'none', fontSize: 24 }}>→</button>
        <span style={{ fontFamily: 'Fredoka One', fontSize: 20 }}>שלב {levelNum}</span>
        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>🪙 {activeChild?.coins ?? 0}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 16, background: '#E0E0E0', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: 32 }}>
        <motion.div
          animate={{ width: `${((index) / exercises.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--color-secondary)', borderRadius: 'var(--radius-pill)' }}
        />
      </div>

      {/* Avatar */}
      <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 16 }}>
        {isCorrect ? '🎉' : isWrong ? '😟' : '🐱'}
      </div>

      {/* Equation */}
      <DndContext onDragEnd={handleDragEnd}>
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, fontSize: 36, fontWeight: 800, marginBottom: 40,
          }}
        >
          <span>{current.operandA}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {current.type === 'addition' ? '+' : '−'}
          </span>
          <span>{current.operandB}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>=</span>
          <AnswerSlot value={droppedAnswer} isCorrect={isCorrect} isWrong={isWrong} />
        </motion.div>

        {/* Number tiles */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {current.options.map((opt) => (
            <NumberTile key={opt} id={String(opt)} value={opt} disabled={isCorrect} />
          ))}
        </div>
      </DndContext>

      {/* Wrong answer helpers */}
      <AnimatePresence>
        {isWrong && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-secondary)', fontSize: 18 }}
          >
            {t('exercise.tryAgain')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Exercise counter */}
      <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--color-text-secondary)' }}>
        {index + 1} / {exercises.length}
      </p>
    </motion.div>
  );
}
