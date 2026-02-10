
import Dexie, { Table } from 'dexie';

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface Task {
  id?: number;
  title: string;
  categoryId: number;
  priority: number; // 1 (High) to 3 (Low)
  order: number; // For manual sorting
  deadline: string; // ISO string
  labels: string[];
  notes: Note[];
  completed: boolean;
  createdAt: number;
  link?: string;
  reminder?: string; // ISO string
}

export interface Event {
  id?: number;
  title: string;
  date: string; // ISO string
  duration: number; // In minutes
  link?: string;
  notes: Note[];
  createdAt: number;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
}

export interface PriorityLabel {
  id: number; // 1, 2, or 3
  label: string;
}

export const db = new Dexie('TaskinoDB') as Dexie & {
  tasks: Table<Task>;
  categories: Table<Category>;
  priorities: Table<PriorityLabel>;
  events: Table<Event>;
};

// Version 8: Migrated Event notes to Note[]
db.version(8).stores({
  tasks: '++id, categoryId, priority, deadline, *labels, createdAt, reminder, order, completed',
  categories: '++id, name',
  priorities: 'id',
  events: '++id, title, date, createdAt'
}).upgrade(async tx => {
  const eventsTable = tx.table('events');
  return eventsTable.toCollection().modify(event => {
    if (typeof event.notes === 'string' || !event.notes) {
      const oldNote = event.notes;
      event.notes = oldNote ? [{
        id: crypto.randomUUID(),
        content: oldNote,
        createdAt: event.createdAt || Date.now()
      }] : [];
    }
  });
});

export const seedDatabase = async () => {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd([
      { name: 'شخصی', color: '#3b82f6' },
      { name: 'کاری', color: '#ef4444' },
      { name: 'آموزشی', color: '#10b981' }
    ]);
  }

  const prioCount = await db.priorities.count();
  if (prioCount === 0) {
    await db.priorities.bulkAdd([
      { id: 1, label: 'خیلی فوری' },
      { id: 2, label: 'متوسط' },
      { id: 3, label: 'عادی' }
    ]);
  }
};
