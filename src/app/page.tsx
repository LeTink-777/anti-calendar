'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarX, CalendarDays, ArrowRight } from 'lucide-react';
import { personalNumber, STORAGE_KEY, SITE } from '@/lib/content';

export default function HomePage() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthDate || personalNumber(birthDate) === null) {
      setError('Укажите дату рождения.');
      return;
    }
    if (new Date(birthDate).getTime() > Date.now()) {
      setError('Дата рождения не может быть в будущем.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Укажите корректный e-mail — на него придёт календарь.');
      return;
    }

    setError('');
    setBusy(true);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        birthDate,
        date: new Date().toISOString(),
        email: email.trim(),
        name: name.trim() || 'Клиент',
      })
    );
    router.push('/result');
  };

  return (
    <>
      <main className="shell">
        <section className="hero">
          <span className="hero-mark">
            <CalendarX size={14} strokeWidth={2.2} />
            Персональный расчёт
          </span>
          <h1>
            Антикалендарь — <em>твои опасные дни, когда лучше не действовать</em>
          </h1>
          <p className="hero-sub">
            Большинство календарей говорят, когда действовать. Этот говорит, когда не надо:
            в какие дни не стоит подписывать документы, начинать новое и принимать решения,
            которые сложно отменить.
          </p>
          <p className="hero-note">Расчёт занимает 15 секунд. Статус сегодняшнего дня — бесплатно.</p>
        </section>

        <section className="narrow" id="form">
          <form className="form-card" onSubmit={submit}>
            <div className="field">
              <label htmlFor="birth">Дата рождения</label>
              <input
                id="birth"
                type="date"
                value={birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
              <p className="field-hint">
                По дате рождения считается личное число — оно и определяет ваши дни.
              </p>
            </div>

            <div className="field">
              <label htmlFor="name">Имя</label>
              <input
                id="name"
                type="text"
                placeholder="Как к вам обращаться"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail для календаря</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error ? <p className="field-error">{error}</p> : null}

            <button className="btn-primary" type="submit" disabled={busy}>
              <CalendarDays size={18} strokeWidth={2} />
              {busy ? 'Считаем календарь...' : 'Рассчитать антикалендарь'}
            </button>

            <p className="consent">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link href="/privacy">политикой конфиденциальности</Link> и{' '}
              <Link href="/offer">условиями оферты</Link>.
            </p>
          </form>
        </section>

        <div className="rule">
          <CalendarX size={17} strokeWidth={2} />
        </div>

        <section className="narrow">
          <h2 className="section-title">Как считается антикалендарь</h2>
          <p className="section-lead">
            Личное число из даты рождения сравнивается с числом каждого дня. Совпадение даёт
            благоприятный день, конфликт — опасный.
          </p>

          <div style={{ marginTop: 26 }}>
            <div className="faq-item">
              <h3>Что значит «опасный день»?</h3>
              <p>
                Не то, что случится беда. Это день, в который решения чаще приходится
                пересматривать. Опасно не время, а необратимое действие в нём — поэтому
                анализ и подготовка в такие дни идут даже лучше обычного.
              </p>
            </div>
            <div className="faq-item">
              <h3>Что учитывается в расчёте?</h3>
              <p>
                Личное число из даты рождения, числовая энергия конкретной даты и
                упрощённые периоды ретроградности, которые понижают статус дня на одну
                ступень.
              </p>
            </div>
            <div className="faq-item">
              <h3>Это точная наука?</h3>
              <p>
                Нет. Нумерология не является наукой, и мы этого не скрываем. Практическая
                польза антикалендаря в другом: он заставляет выдерживать паузу перед
                необратимыми решениями — а это работает независимо от чисел.
              </p>
            </div>
          </div>
        </section>

        <section className="narrow" style={{ marginTop: 48, textAlign: 'center' }}>
          <a className="btn-primary" href="#form" style={{ maxWidth: 380, margin: '0 auto' }}>
            Рассчитать антикалендарь
            <ArrowRight size={18} strokeWidth={2} />
          </a>
        </section>
      </main>

      <footer className="site-foot shell">
        <p>
          <Link href="/blog">Блог</Link>
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
