export const commands = [
  {
    command: "nextgame",
    description: "Скажет с кем следующая игра",
  },
  {
    command: "previousgame",
    description: "Скажет как закончилась предыдущая",
  },
  { command: "scorers", description: "Список бомбардиров Серии А" },
  { command: "standings", description: "Турнирная таблица Серии А" },
  { command: "squad", description: "Состав Юве" },
  { command: "reminders", description: "Напоминания от бота в день игры" },
];

interface data {}
export const months: { [key: string]: string | number } = {
  "01": "января",
  "02": "февраля",
  "03": "марта",
  "04": "апреля",
  "05": "мая",
  "06": "июня",
  "07": "июля",
  "08": "августа",
  "09": "сентября",
  "10": "октября",
  "11": "ноября",
  "12": "декабря",
};
