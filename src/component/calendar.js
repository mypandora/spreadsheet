import { cssPrefix } from '../config';
import { t } from '../locale';
import { h } from './element';
import Icon from './icon';

function addMonth(date, step) {
  date.setMonth(date.getMonth() + step);
}

function addYear(date, step) {
  date.setFullYear(date.getFullYear() + step);
}

function weekday(date, index) {
  const d = new Date(date);
  d.setDate(index - date.getDay() + 1);
  return d;
}

function monthDays(year, month, cdate) {
  // the first day of month
  const startDate = new Date(year, month, 1, 23, 59, 59);
  const datess = [[], [], [], [], [], []];
  for (let i = 0; i < 6; i += 1) {
    for (let j = 0; j < 7; j += 1) {
      const index = i * 7 + j;
      const d = weekday(startDate, index);
      const disabled = d.getMonth() !== month;
      const active = d.getMonth() === cdate.getMonth() && d.getDate() === cdate.getDate();
      datess[i][j] = { d, disabled, active };
    }
  }
  return datess;
}

function buildYear(year) {
  const arr = [];
  for (let i = year - 10; i < year + 10; i += 1) {
    if (i === year) {
      arr.push(h('option', 'active').attr('selected', true).val(i).html(i));
    } else {
      arr.push(h('option').val(i).html(i));
    }
  }
  return arr;
}

function buildMoth(month) {
  const arr = [];
  for (let i = 0; i < 12; i += 1) {
    if (i === month) {
      arr.push(
        h('option', 'active')
          .attr('selected', true)
          .val(i)
          .html(`${t('calendar.months')[i]}`)
      );
    } else {
      arr.push(
        h('option', '')
          .val(i)
          .html(`${t('calendar.months')[i]}`)
      );
    }
  }
  return arr;
}

export default class Calendar {
  constructor(value) {
    this.value = value;
    this.cvalue = new Date(value);

    this.bodyEl = h('tbody', '');
    this.yearEl = h('div', 'calendar-header-label').children(
      (this.yearLabel = h('span', '').on('click', () => {
        this.yearSelect.show();
      })),
      (this.yearSelect = h('select', 'calendar-select')
        .attr('title', 'select year')
        .on('change', (evt) => this.selectYear(evt.target.value))
        .children(...buildYear(this.cvalue.getFullYear())))
    );
    this.monthEl = h('div', 'calendar-header-label').children(
      (this.monthLabel = h('span', '').on('click', () => {
        this.monthSelect.show();
      })),
      (this.monthSelect = h('select', 'calendar-select')
        .attr('title', 'select month')
        .on('change', (evt) => this.selectMonth(evt.target.value))
        .children(...buildMoth(this.cvalue.getMonth())))
    );
    this.buildAll();
    this.el = h('div', `${cssPrefix}-calendar`).children(
      h('div', 'calendar-header').children(
        this.yearEl,
        this.monthEl,
        h('a', 'calendar-prev')
          .on('click.stop', () => this.prev())
          .child(new Icon('chevron-left')),
        h('a', 'calendar-next')
          .on('click.stop', () => this.next())
          .child(new Icon('chevron-right'))
      ),
      h('table', 'calendar-body').children(
        h('thead', '').child(h('tr', '').children(...t('calendar.weeks').map((week) => h('th', 'cell').child(week)))),
        this.bodyEl
      )
    );
    this.selectChange = () => {};
  }

  setValue(value) {
    this.value = value;
    this.cvalue = new Date(value);
    this.buildAll();
  }

  selectYear(year) {
    const { value, cvalue } = this;
    const currentYear = cvalue.getFullYear();
    addYear(value, +year - currentYear);
    this.buildAll();
  }

  selectMonth(month) {
    const { value, cvalue } = this;
    const currentMonth = cvalue.getMonth();
    addMonth(value, +month - currentMonth);
    this.buildAll();
  }

  prev() {
    const { value } = this;
    addMonth(value, -1);
    this.buildAll();
  }

  next() {
    const { value } = this;
    addMonth(value, 1);
    this.buildAll();
  }

  buildAll() {
    this.buildHeaderLeft();
    this.buildBody();
  }

  buildHeaderLeft() {
    const { value } = this;
    this.yearLabel.html(`${value.getFullYear()}`);
    this.monthLabel.html(`${t('calendar.months')[value.getMonth()]}`);
  }

  buildBody() {
    const { value, cvalue, bodyEl } = this;
    const mDays = monthDays(value.getFullYear(), value.getMonth(), cvalue);
    const trs = mDays.map((it) => {
      const tds = it.map((it1) => {
        let cls = 'cell';
        if (it1.disabled) {
          cls += ' disabled';
        }
        if (it1.active) {
          cls += ' active';
        }
        return h('td', '').child(
          h('div', cls)
            .on('click.stop', () => {
              this.selectChange(it1.d);
            })
            .child(it1.d.getDate().toString())
        );
      });
      return h('tr', '').children(...tds);
    });
    bodyEl.html('').children(...trs);
  }
}
