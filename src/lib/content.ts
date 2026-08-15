import type { Plan, SiteConfig, UserData, Section, PlanId } from './types';
import { PLAN_LABELS } from './types';

export const SITE: SiteConfig = {
  name: 'Антикалендарь опасных дней',
  domain: 'udachnye-dni.online',
  url: 'https://udachnye-dni.online',
  accent: '#EF4444',
  theme: 'dark',
  pdfFont: 'PTSans',
};

export const STORAGE_KEY = 'anti_calendar_data';

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Текущая неделя',
    price: 290,
    oldPrice: 890,
    tagline: 'Семь дней открыты полностью',
    features: [
      'Все семь дней недели с оценкой',
      'Причина статуса каждого дня',
      'Что делать и чего не делать',
    ],
  },
  {
    id: 'full',
    name: 'Текущий месяц',
    price: 590,
    oldPrice: 1990,
    tagline: 'Весь месяц без белых пятен',
    featured: true,
    features: [
      'Всё из «Текущей недели»',
      'Полный месяц по дням',
      'Список всех опасных дат',
      'Лучшие дни месяца для решений',
      'Периоды ретроградности',
    ],
  },
  {
    id: 'premium',
    name: 'Квартал',
    price: 1190,
    oldPrice: 3990,
    tagline: 'Три месяца вперёд',
    features: [
      'Всё из «Текущего месяца»',
      'Три месяца по дням',
      'Календарь крупных решений',
      'Аудиоразбор вашего числа',
    ],
  },
];

export type DayStatus = 'danger' | 'caution' | 'safe';

export const STATUS_LABEL: Record<DayStatus, string> = {
  danger: 'Опасно',
  caution: 'Осторожно',
  safe: 'Безопасно',
};

function reduce(n: number): number {
  let sum = n;
  while (sum > 9) {
    sum = String(sum)
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return sum || 9;
}

export function personalNumber(birth: string): number | null {
  const digits = birth.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  return reduce(sum);
}

export function dayNumber(date: Date): number {
  const s = `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`;
  return reduce(s.split('').reduce((acc, d) => acc + Number(d), 0));
}

/** Упрощённые периоды ретроградности Меркурия на 2026 год. */
const RETROGRADE: [string, string][] = [
  ['2026-02-26', '2026-03-20'],
  ['2026-06-29', '2026-07-23'],
  ['2026-10-24', '2026-11-13'],
];

export function isRetrograde(date: Date): boolean {
  const iso = date.toISOString().slice(0, 10);
  return RETROGRADE.some(([from, to]) => iso >= from && iso <= to);
}

export function dayStatus(date: Date, personal: number): DayStatus {
  const day = dayNumber(date);
  const diff = Math.abs(day - personal);

  let status: DayStatus;
  if (day === personal) status = 'safe';
  else if (diff === 4 || diff === 5) status = 'danger';
  else if (diff === 2 || diff === 7) status = 'caution';
  else status = 'safe';

  // Ретроградность понижает статус на одну ступень.
  if (isRetrograde(date)) {
    if (status === 'safe') status = 'caution';
    else if (status === 'caution') status = 'danger';
  }

  return status;
}

export const STATUS_WHY: Record<DayStatus, (day: number, personal: number) => string> = {
  danger: (day, personal) =>
    `Энергия дня — число ${day} — вступает в прямой конфликт с вашим личным числом ${personal}. В нумерологии такое сочетание считают днём рассогласования: решения, принятые в этот день, чаще всего приходится пересматривать.`,
  caution: (day, personal) =>
    `Энергия дня — число ${day} — нейтральна к вашему личному числу ${personal}, но не поддерживает его. День рабочий, однако детали в нём теряются, а договорённости легко понимаются двояко.`,
  safe: (day, personal) =>
    `Энергия дня — число ${day} — согласуется с вашим личным числом ${personal}. Такой день поддерживает ваши действия: сопротивление среды минимально.`,
};

export const STATUS_ADVICE: Record<DayStatus, string> = {
  danger:
    'Что не делать: не подписывайте договоры, не берите кредиты, не начинайте переговоры о деньгах, не увольняйтесь и не делайте крупных покупок. Не выясняйте отношения — сказанное сегодня запомнят надолго.\n\nЧто делать вместо: планировать, анализировать, собирать информацию, готовить документы, учиться. Всё, что не требует необратимого решения, сегодня идёт хорошо.',
  caution:
    'Что делать: действовать можно, но проверяйте детали дважды. Перечитывайте договоры до подписи, уточняйте суммы и сроки письменно, переспрашивайте, если формулировка допускает два толкования.\n\nЧего избегать: спешки и устных договорённостей. Всё, о чём договорились сегодня, зафиксируйте текстом.',
  safe:
    'Что делать: подписывать, начинать, договариваться, покупать, знакомиться, просить о повышении. Сегодня среда работает на вас, и сопротивление минимально.\n\nЧего избегать: откладывания. Благоприятные дни редки — используйте их для того, что давно откладывали.',
};

export interface DayInfo {
  date: Date;
  status: DayStatus;
  day: number;
  retro: boolean;
}

export function buildDays(from: Date, count: number, personal: number): DayInfo[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return {
      date,
      status: dayStatus(date, personal),
      day: dayNumber(date),
      retro: isRetrograde(date),
    };
  });
}

export function parseBirth(value: string | undefined): string | null {
  if (!value) return null;
  return personalNumber(value) === null ? null : value;
}

export function parseToday(value: string | undefined): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function fmt(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', weekday: 'short' });
}

export function pdfTitle(userData: UserData): string {
  const personal = personalNumber(userData.birthDate || '');
  return personal ? `Антикалендарь — личное число ${personal}` : SITE.name;
}

export function buildSections(userData: UserData, plan: PlanId): Section[] {
  const personal = personalNumber(userData.birthDate || '');

  if (!personal) {
    return [
      {
        title: 'Данные не распознаны',
        content:
          'Не удалось прочитать дату рождения. Вернитесь на сайт и заполните форму заново.',
      },
    ];
  }

  const today = parseToday(userData.date);
  const sections: Section[] = [];
  const todayInfo = buildDays(today, 1, personal)[0];

  sections.push({
    title: 'Ваше личное число',
    content: `Дата рождения: ${userData.birthDate}\nЛичное число: ${personal}\n\nЛичное число рассчитывается как сумма всех цифр даты рождения, свёрнутая до одного разряда. Оно не меняется и задаёт, какие дни для вас рабочие, а какие — нет.`,
  });

  sections.push({
    title: `Сегодня: ${STATUS_LABEL[todayInfo.status]}`,
    content: `${STATUS_WHY[todayInfo.status](todayInfo.day, personal)}${
      todayInfo.retro ? '\n\nДополнительно: дата попадает в период ретроградности, что понижает статус дня на одну ступень.' : ''
    }`,
  });

  sections.push({ title: 'Что делать и чего не делать сегодня', content: STATUS_ADVICE[todayInfo.status] });

  const horizon = plan === 'basic' ? 7 : plan === 'full' ? 31 : 92;
  const days = buildDays(today, horizon, personal);

  sections.push({
    title: plan === 'basic' ? 'Ближайшие 7 дней' : plan === 'full' ? 'Ближайший месяц' : 'Ближайший квартал',
    content: days
      .map((d) => `${fmt(d.date)} — ${STATUS_LABEL[d.status]}${d.retro ? ' (ретроградность)' : ''}`)
      .join('\n'),
  });

  if (plan === 'full' || plan === 'premium') {
    const dangerous = days.filter((d) => d.status === 'danger');
    sections.push({
      title: 'Все опасные даты периода',
      content: dangerous.length
        ? dangerous.map((d) => fmt(d.date)).join(', ') +
          '\n\nВ эти дни не подписывайте договоров, не берите кредитов и не принимайте необратимых решений.'
        : 'В этом периоде опасных дней не выявлено — редкий и благоприятный расклад.',
    });

    const best = days.filter((d) => d.status === 'safe').slice(0, 12);
    sections.push({
      title: 'Лучшие дни для важных решений',
      content: best.length
        ? best.map((d) => fmt(d.date)).join(', ') +
          '\n\nПланируйте на эти даты подписание документов, крупные покупки, переговоры и всё, что откладывали.'
        : 'Благоприятных дней в этом периоде мало — выбирайте дни со статусом «Осторожно» и проверяйте детали дважды.',
    });

    const retroDays = days.filter((d) => d.retro);
    sections.push({
      title: 'Периоды ретроградности',
      content: retroDays.length
        ? `В выбранном периоде ретроградность затрагивает ${retroDays.length} дней: с ${fmt(retroDays[0].date)} по ${fmt(retroDays[retroDays.length - 1].date)}. В это время особенно тщательно перечитывайте документы и подтверждайте договорённости письменно.`
        : 'В выбранном периоде ретроградных отрезков нет.',
    });
  }

  if (plan === 'premium') {
    sections.push({
      title: 'Календарь крупных решений',
      content:
        'Правило планирования по антикалендарю. Крупные решения — сделки, кредиты, увольнения, переезды — назначайте только на дни со статусом «Безопасно», и лучше за две недели вперёд, а не в последний момент.\n\nПодготовку к решению, наоборот, удобно вести в опасные дни: анализ, сбор документов и расчёты в такие дни идут даже лучше обычного. Опасен не сам день, а необратимое действие в нём.\n\nЕсли срочное решение выпадает на опасный день, добавьте одну процедуру: письменно сформулируйте, что именно вы решаете и почему, и перечитайте на следующее утро. В большинстве случаев этого достаточно.',
    });
    sections.push({
      title: 'Аудиоразбор',
      content:
        'Аудиоразбор вашего личного числа и стратегии планирования приходит отдельным письмом в течение 6 часов.',
    });
  }

  sections.push({
    title: 'О документе',
    content: `Тариф: ${PLAN_LABELS[plan]}. Материал носит развлекательный характер и не является финансовой, юридической или медицинской рекомендацией. Расчёт основан на нумерологии — это не научный метод. Решения принимайте самостоятельно.`,
  });

  return sections;
}
