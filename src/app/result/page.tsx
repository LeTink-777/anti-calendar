'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Check, CalendarX, CalendarDays, ArrowRight, X } from 'lucide-react';
import {
  PLANS,
  STORAGE_KEY,
  STATUS_LABEL,
  STATUS_WHY,
  STATUS_ADVICE,
  personalNumber,
  dayNumber,
  dayStatus,
  isRetrograde,
  SITE,
  type DayStatus,
} from '@/lib/content';
import type { PlanId, UserData } from '@/lib/types';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
// Сколько дней открывает каждый тариф — для мини-календаря.
const REVEAL = [7, 31, 92];

export default function ResultPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [personal, setPersonal] = useState<number | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [paying, setPaying] = useState<PlanId | null>(null);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    let data: UserData = {};
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as UserData;
    } catch {
      data = {};
    }
    const p = personalNumber(data.birthDate || '');
    if (!p) {
      router.replace('/');
      return;
    }
    setUser(data);
    setPersonal(p);
    setToday(new Date());
  }, [router]);

  const pay = async (plan: PlanId) => {
    if (!user) return;
    setPaying(plan);
    setPayError('');
    localStorage.setItem('selected_plan', plan);
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userData: user }),
      });
      const data = await res.json();
      if (data?.confirmationUrl) {
        window.location.href = data.confirmationUrl;
        return;
      }
      setPayError(data?.error || 'Не удалось создать платёж. Попробуйте ещё раз.');
    } catch {
      setPayError('Сервис оплаты временно недоступен. Попробуйте через минуту.');
    }
    setPaying(null);
  };

  if (!user || !personal || !today) {
    return (
      <main className="shell" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Считаем календарь...</p>
      </main>
    );
  }

  const status: DayStatus = dayStatus(today, personal);
  const num = dayNumber(today);

  // Сетка текущего месяца, понедельник — первый день.
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  const cells: ({ date: Date; status: DayStatus } | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
      return { date: d, status: dayStatus(d, personal) };
    }),
  ];

  return (
    <>
      <main className="shell" style={{ paddingTop: 48 }}>
        <motion.section
          className="today-panel"
          data-status={status}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="today-date">
            Сегодня,{' '}
            {today.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              weekday: 'long',
            })}
          </p>
          <h1 className="today-status">{STATUS_LABEL[status]}</h1>
          <p className="today-why">
            {STATUS_WHY[status](num, personal)}
            {isRetrograde(today)
              ? ' Дата попадает в период ретроградности — статус понижен на одну ступень.'
              : ''}
          </p>
          <span className="personal-badge">
            Ваше личное число: <strong>{personal}</strong>
          </span>
        </motion.section>

        <div className="rule">
          <CalendarX size={17} strokeWidth={2} />
        </div>

        <section className="narrow">
          <h2 className="section-title" style={{ fontSize: 22, marginBottom: 18 }}>
            {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>

          <div className="lock-stack">
            <div className="lock-veil">
              <Lock size={26} strokeWidth={1.8} color="var(--accent)" />
              <h3>Месяц закрыт</h3>
              <p>
                Оценка каждого дня, список всех опасных дат и что делать в каждый тип дня —
                открываются ниже.
              </p>
            </div>

            <div className="locked-blur" aria-hidden="true">
              <div className="cal-head">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="cal-grid">
                {cells.map((cell, i) =>
                  cell ? (
                    <div
                      className="cal-cell"
                      key={i}
                      data-status={cell.status}
                      data-today={
                        cell.date.toDateString() === today.toDateString() ? 'true' : 'false'
                      }
                    >
                      {cell.date.getDate()}
                      <span className="cal-mark">
                        {cell.status === 'danger' ? '×' : cell.status === 'caution' ? '!' : '·'}
                      </span>
                    </div>
                  ) : (
                    <div className="cal-cell" key={i} data-empty="true" />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="cal-legend">
            <span>
              <i style={{ background: 'var(--accent)' }} />
              Опасно
            </span>
            <span>
              <i style={{ background: 'var(--accent-caution)' }} />
              Осторожно
            </span>
            <span>
              <i style={{ background: 'var(--accent-safe)' }} />
              Безопасно
            </span>
          </div>

          <div className="info-card" style={{ marginTop: 30 }}>
            <h3>
              <CalendarDays size={17} strokeWidth={2} />
              Что делать сегодня
            </h3>
            {STATUS_ADVICE[status].split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <div className="rule">
          <CalendarX size={17} strokeWidth={2} />
        </div>

        <section>
          <h2 className="section-title">Раскройте календарь</h2>
          <p className="section-lead">
            Чем шире горизонт, тем раньше вы увидите даты, на которые нельзя ставить важные
            решения.
          </p>

          <div className="reveals">
            {PLANS.map((plan, index) => {
              const discount = Math.round((1 - plan.price / plan.oldPrice) * 100);
              const on = Math.min(35, REVEAL[index]);
              return (
                <div
                  key={plan.id}
                  className="reveal"
                  data-featured={plan.featured ? 'true' : 'false'}
                >
                  {plan.featured ? <span className="reveal-badge">Выбор большинства</span> : null}

                  <div className="reveal-mini" aria-hidden="true">
                    {Array.from({ length: 35 }, (_, i) => (
                      <i key={i} data-on={i < on ? 'true' : 'false'} />
                    ))}
                  </div>

                  <h3>{plan.name}</h3>
                  <p className="reveal-tagline">{plan.tagline}</p>

                  <div className="reveal-price">
                    <span className="now">{plan.price} ₽</span>
                    <span className="was">{plan.oldPrice} ₽</span>
                    <span className="off">−{discount}%</span>
                  </div>

                  <ul className="reveal-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={15} strokeWidth={2.4} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="reveal-cta"
                    disabled={paying !== null}
                    onClick={() => pay(plan.id)}
                  >
                    {paying === plan.id ? (
                      'Открываем оплату...'
                    ) : (
                      <>
                        Открыть календарь
                        <ArrowRight size={16} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {payError ? (
            <p className="field-error" style={{ textAlign: 'center', marginTop: 20 }}>
              {payError}
            </p>
          ) : null}

          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              textAlign: 'center',
              marginTop: 26,
              fontSize: 13.5,
              color: 'var(--text-secondary)',
            }}
          >
            <X size={14} strokeWidth={2.4} />
            Оплата через ЮKassa. Календарь открывается сразу и дублируется на почту.
          </p>
        </section>
      </main>

      <footer className="site-foot shell">
        <p>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <Link href="/offer">Публичная оферта</Link>
        </p>
        <p>
          Евдокимов Даниил Владимирович · ИНН 381928138362 · Самозанятый
          <br />
          danyavdkmvv3@gmail.com · @dvdkmv
        </p>
        <p className="disclaimer">
          {SITE.name} — развлекательный сервис. Материалы не являются финансовой,
          юридической или медицинской рекомендацией.
        </p>
      </footer>
    </>
  );
}
