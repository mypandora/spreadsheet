import EXTEND_DATA from './public/extend-data';
import PUBLIC_DATA from './public/public-data';
import Spreadsheet from './src';

// 1
const saveIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTc3MTc3MDkyOTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2NzgiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTIxMy4zMzMzMzMgMTI4aDU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMgODUuMzMzMzMzdjU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMgODUuMzMzMzMzSDIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMtODUuMzMzMzMzVjIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMtODUuMzMzMzMzeiBtMzY2LjkzMzMzNCAxMjhoMzQuMTMzMzMzYTI1LjYgMjUuNiAwIDAgMSAyNS42IDI1LjZ2MTE5LjQ2NjY2N2EyNS42IDI1LjYgMCAwIDEtMjUuNiAyNS42aC0zNC4xMzMzMzNhMjUuNiAyNS42IDAgMCAxLTI1LjYtMjUuNlYyODEuNmEyNS42IDI1LjYgMCAwIDEgMjUuNi0yNS42ek0yMTMuMzMzMzMzIDIxMy4zMzMzMzN2NTk3LjMzMzMzNGg1OTcuMzMzMzM0VjIxMy4zMzMzMzNIMjEzLjMzMzMzM3ogbTEyOCAwdjI1NmgzNDEuMzMzMzM0VjIxMy4zMzMzMzNoODUuMzMzMzMzdjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjcgNDIuNjY2NjY3SDI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjIxMy4zMzMzMzNoODUuMzMzMzMzek0yNTYgMjEzLjMzMzMzM2g4NS4zMzMzMzMtODUuMzMzMzMzeiBtNDI2LjY2NjY2NyAwaDg1LjMzMzMzMy04NS4zMzMzMzN6IG0wIDU5Ny4zMzMzMzR2LTEyOEgzNDEuMzMzMzMzdjEyOEgyNTZ2LTE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDQyNi42NjY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djE3MC42NjY2NjdoLTg1LjMzMzMzM3ogbTg1LjMzMzMzMyAwaC04NS4zMzMzMzMgODUuMzMzMzMzek0zNDEuMzMzMzMzIDgxMC42NjY2NjdIMjU2aDg1LjMzMzMzM3oiIHAtaWQ9IjI2NzkiIGZpbGw9IiMyYzJjMmMiPjwvcGF0aD48L3N2Zz4=';
// 2
const previewEl = document.createElement('img');
previewEl.src =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjIxMzI4NTkxMjQzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjU2NjMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNNTEyIDE4Ny45MDRhNDM1LjM5MiA0MzUuMzkyIDAgMCAwLTQxOC41NiAzMTUuNjQ4IDQzNS4zMjggNDM1LjMyOCAwIDAgMCA4MzcuMTIgMEE0MzUuNDU2IDQzNS40NTYgMCAwIDAgNTEyIDE4Ny45MDR6TTUxMiAzMjBhMTkyIDE5MiAwIDEgMSAwIDM4NCAxOTIgMTkyIDAgMCAxIDAtMzg0eiBtMCA3Ni44YTExNS4yIDExNS4yIDAgMSAwIDAgMjMwLjQgMTE1LjIgMTE1LjIgMCAwIDAgMC0yMzAuNHpNMTQuMDggNTAzLjQ4OEwxOC41NiA0ODUuNzZsNC44NjQtMTYuMzg0IDQuOTI4LTE0Ljg0OCA4LjA2NC0yMS41NjggNC4wMzItOS43OTIgNC43MzYtMTAuODggOS4zNDQtMTkuNDU2IDEwLjc1Mi0yMC4wOTYgMTIuNjA4LTIxLjMxMkE1MTEuNjE2IDUxMS42MTYgMCAwIDEgNTEyIDExMS4xMDRhNTExLjQ4OCA1MTEuNDg4IDAgMCAxIDQyNC41MTIgMjI1LjY2NGwxMC4yNCAxNS42OGMxMS45MDQgMTkuMiAyMi41OTIgMzkuMTA0IDMyIDU5Ljc3NmwxMC40OTYgMjQuOTYgNC44NjQgMTMuMTg0IDYuNCAxOC45NDQgNC40MTYgMTQuODQ4IDQuOTkyIDE5LjM5Mi0zLjIgMTIuODY0LTMuNTg0IDEyLjgtNi40IDIwLjA5Ni00LjQ4IDEyLjYwOC00Ljk5MiAxMi45MjhhNTExLjM2IDUxMS4zNiAwIDAgMS0xNy4yOCAzOC40bC0xMi4wMzIgMjIuNC0xMS45NjggMjAuMDk2QTUxMS41NTIgNTExLjU1MiAwIDAgMSA1MTIgODk2YTUxMS40ODggNTExLjQ4OCAwIDAgMS00MjQuNDQ4LTIyNS42bC0xMS4zMjgtMTcuNTM2YTUxMS4yMzIgNTExLjIzMiAwIDAgMS0xOS44NC0zNS4wMDhMNTMuMzc2IDYxMS44NGwtOC42NC0xOC4yNC0xMC4xMTItMjQuMTI4LTcuMTY4LTE5LjY0OC04LjMyLTI2LjYyNC0yLjYyNC05Ljc5Mi0yLjQ5Ni05LjkyeiIgcC1pZD0iNTY2NCI+PC9wYXRoPjwvc3ZnPg==';
previewEl.width = 16;
previewEl.height = 16;
// 3
const ulEl = document.createElement('ul');
for (let i = 0; i < 10; i += 1) {
  const liEl = document.createElement('li');
  liEl.innerHTML = `li${i}`;
  ulEl.appendChild(liEl);
}

const xs = Spreadsheet('#app', {
  language: 'zh', // 语言： zh | en ，默认为zh
  mode: 'edit', // 模式： edit | read ，默认为edit
  // 上传文件的配置
  upload: {
    url: 'https://api.bayfiles.com/upload',
    method: 'POST',
    headers: {},
    params: {},
    name: 'file',
    success: (res) => {
      console.log(res);
    },
  },
  remote: {
    baseURL: '/dev-api',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VyX2tleSI6IjVjMjdkNTllLTRkYTAtNDcyMy05Njc2LWJjMTc1MDExZmNlMSIsInVzZXJuYW1lIjoiYWRtaW4ifQ.xh2e9s1iXj9m-bSFW5m4JIfGaaQJsjLHJt3ha2_Ya27FdzzZc7JtVhNH-UyH7CfCnahEmkduRDxkD6KEHJeenw',
    },
  },
  view: {
    height: () => document.documentElement.clientHeight,
    width: () => document.documentElement.clientWidth,
  },
  showGrid: true, // 是否显示网格，默认为ture
  showToolbar: true, // 是否显示工具栏，默认为ture
  showContextmenu: true, // 是否显示右键菜单，默认为ture
  hideContextmenuItem: ['cell-editable', 'cell-non-editable', 'paste-value', 'paste-format'], // 隐藏右键菜单项，'cell-format'
  showBottomBar: true, // 是否显示底部状态栏，默认为ture
  disableToolbar: [], // 禁用工具栏按钮 "paintFormat",'undo', 'redo','format','font','fontSize'
  row: {
    len: 100, // 行数，默认为100
    height: 25, // 行高，默认为25，为什么不需要indexHeight? 因为它借用了height的值，所以不需要indexHeight，如果想分开设置，可以设置indexHeight
    indexHeight: 25, // 行索引高度，默认为25，就是 A B C D ... 的高度
    minHeight: 1,
  },
  col: {
    len: 26, // 列数，默认为26
    width: 50, // 列宽，默认为100
    indexWidth: 60, // 索引列宽度，默认为60，就是 1 2 3 4 ... 的宽度
    minWidth: 1, // 最小列宽，默认为60
  },
  extendToolbar: {
    // 扩展工具栏按钮，在这里将按钮分为三类：icon(可带图标按钮) toggle(可切换状态按钮) dropdown(下拉菜单按钮)
    left: [
      {
        type: 'toggle', // 三种按钮类型之一: toggle
        tag: 'icon-toggle', // 可为按钮定义一个名称
        tip: 'toggle 型按钮',
        el: previewEl, // 按钮图标，可为一个包含图标的 dom 片段
        onClick: (data, sheet) => {
          console.log('click toggle button：', data, sheet);
        },
      },
      {
        type: 'dropdown', // 三种按钮类型之一: dropdown
        tag: 'icon-dropdown', // 可为按钮定义一个名称
        tip: 'dropdown 型按钮',
        width: '200px', // 下拉框宽度
        value: '',
        content: ulEl, // 下拉框显示的内容
        icon: saveIcon, // 下拉框按钮，可为空，为空则使用输入框
        onClick: (data, sheet) => {
          console.log('click save button：', data, sheet);
        },
      },
    ],
    right: [
      {
        type: 'icon',
        tag: 'icon-preview',
        tip: 'Preview',
        el: previewEl,
        onClick: (data) => {
          console.log('click preview button：', data);
        },
      },
    ],
  },
})
  .loadData([EXTEND_DATA, PUBLIC_DATA])
  .change((data) => {
    console.log('changeData', data);
  })
  .on('cells-selected', (cell, range) => {
    console.log('cells-selected >>>> cell, range is ', cell, range);
  })
  .on('cell-selected', (cell, rowIndex, colIndex) => {
    console.log('cell-selected >>>> cell, rowIndex, colIndex is ', cell, rowIndex, colIndex);
  })
  .on('cell-edited', (text, rowIndex, colIndex, cell) => {
    console.log('cell-edited >>>> text, rowIndex, colIndex, cell is ', text, rowIndex, colIndex, cell);
  })
  .on('cell-drop', (data, rowIndex, colIndex, ev) => {
    console.log('cell-drop >>>> text, rowIndex, colIndex, ev is ', rowIndex, colIndex, ev);
  });

setTimeout(() => {
  xs.cellText(14, 4, 'cell-text111').reRender();
}, 5000);
