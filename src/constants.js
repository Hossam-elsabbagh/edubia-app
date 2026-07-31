export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];
export const SESSION_TYPES = ['paid', 'cover', 'free'];
export const TYPE_LABELS = { paid: 'Paid', cover: 'Cover', free: 'Free' };
export const DEFAULT_PRICES = { paid: 150, cover: 150, free: 100 };
export const COURSE_OPTIONS = ['Python', 'Web Development', 'Data Science', 'AI', 'UI & UX', 'Scratch', 'Other'];

export const emptyStudent = { name: '', age: '', nationality: '' };
export const emptySession = {
  student_id: '',
  course: 'Python',
  day: 'Saturday',
  hour: 14,
  current_session: '1',
  type: 'paid',
  session_date: '',
  price: DEFAULT_PRICES.paid,
};
