export class HeatMap {
  static colorSet = ['#EDEDED', '#ACD5F2', '#7FA8C9', '#527BA0', '#254E77'];
  static infos = {
    months: [
      'Янв.',
      'Фев.',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Авг.',
      'Сен.',
      'Окт.',
      'Нояб.',
      'Дек.',
    ],
    days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    dayOfWeek: new Map([
      [0, 'Воскресенья'],
      [1, 'Понедельник'],
      [2, 'Вторник'],
      [3, 'Среда'],
      [4, 'Четверг'],
      [5, 'Пятница'],
      [6, 'Суббота'],
    ]),
    less: 'Меньше',
    more: 'Больше',
    defaultTooltipMessage: 'контрибуций',
    noDataTooltipMessage: 'Нет контрибуций',
  };

  static daysToShift = 350;
  static daysInWeek = 7;
  static squareSize = 10;
  static legendSquareSize = 15;
  static max = 30;

  static activityColorRules = [
    {
      min: 0,
      max: 0,
      colorIndex: 0,
    },
    {
      min: 1,
      max: 9,
      colorIndex: 1,
    },
    {
      min: 10,
      max: 19,
      colorIndex: 2,
    },
    {
      min: 20,
      max: 29,
      colorIndex: 3,
    },
    {
      min: 30,
      max: Number.MAX_SAFE_INTEGER,
      colorIndex: 4,
    },
  ];
  static _startDate;
  static _endDate;
  static _values;
  static _fullWeekOfMonth;
  static _activities;
  static _graph;

  constructor(endDate, values) {
    this._endDate = HeatMap.parseDate(endDate);
    this._startDate = HeatMap.shiftDate(endDate, -HeatMap.daysToShift);
    this._values = values;
  }

  get values() {
    return this._values;
  }

  get activities() {
    if (this._activities) return this._activities;

    this._activities = new Map();
    for (let i = 0, len = this.values.length; i < len; i++) {
      this._activities.set(HeatMap.keyDayParser(this.values[i].date), {
        count: this.values[i].count,
        colorIndex: this.getColorIndex(this.values[i].count) || 0,
      });
    }
    return this._activities;
  }

  get weekCount() {
    return this.getDaysCount() / HeatMap.daysInWeek;
  }

  get graph() {
    if (this._graph) return this._graph;
    let shiftToMonday = -this.getCountEmptyDaysAtEnd() + 1,
      date = HeatMap.shiftDate(this._startDate, shiftToMonday);
    this._graph = new Array(this.weekCount);

    for (let i = 0; i < this._graph?.length; i++) {
      this._graph[i] = new Array(this.weekCount);
      for (let j = 0; j < HeatMap.daysInWeek; j++) {
        const activity = this.activities.get(HeatMap.keyDayParser(date));

        this._graph[i][j] = {
          date: new Date(date),
          count: activity ? activity.count : undefined,
          colorIndex: activity ? activity.colorIndex : 0,
        };
        date.setDate(date.getDate() + 1);
      }
    }
    return this._graph;
  }

  get fullWeekOfMonths() {
    if (this._fullWeekOfMonth) return this._fullWeekOfMonth;

    this._fullWeekOfMonth = [];
    for (let index = 1; index < this.graph?.length; index++) {
      const lastWeek = this.graph[index - 1][0].date;
      const currentWeek = this.graph[index][0].date;
      if (
        lastWeek.getFullYear() < currentWeek.getFullYear() ||
        lastWeek.getMonth() < currentWeek.getMonth()
      ) {
        this._fullWeekOfMonth.push({ value: currentWeek.getMonth(), index });
      }
    }
    return this._fullWeekOfMonth;
  }

  static shiftDate(date, daysToShift) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + daysToShift);
    return newDate;
  }

  static parseDate(date) {
    return date instanceof Date ? date : new Date(date);
  }

  static keyDayParser(date) {
    const day = HeatMap.parseDate(date);
    const newDay =
      String(day.getFullYear()) +
      String(day.getMonth()).padStart(2, '0') +
      String(day.getDate()).padStart(2, '0');
    return newDay;
  }

  getColorIndex(count) {
    let colorIndex = 0;
    if (count === undefined) return colorIndex;
    for (let i = 0; i < HeatMap.activityColorRules?.length; i++) {
      if (
        count >= HeatMap.activityColorRules[i].min &&
        count <= HeatMap.activityColorRules[i].max
      ) {
        colorIndex = HeatMap.activityColorRules[i].colorIndex;
        break;
      }
    }
    return colorIndex;
  }

  getCountEmptyDaysAtStart() {
    return this._startDate.getDay();
  }
  getCountEmptyDaysAtEnd() {
    return HeatMap.daysInWeek - 1 - this._endDate.getDay();
  }

  getDaysCount() {
    return (
      HeatMap.daysToShift +
      1 +
      this.getCountEmptyDaysAtStart() +
      this.getCountEmptyDaysAtEnd()
    );
  }
}
