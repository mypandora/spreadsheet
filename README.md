## 用法

## NPM

```shell
npm install @mypandora/spreadsheet
```

```html
<div id="test"></div>
```

```javascript
import Spreadsheet from '@mypandora/spreadsheet';
import '@mypandora/spreadsheet/dist/styles/spreadsheet.css';

const s = Spreadsheet('#test')
  .loadData({})
  .change((data) => {
    // save data to db
  });
```

## Browser

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@mypandora/spreadsheet@0.0.1/dist/styles/spreadsheet.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@mypandora/spreadsheet@0.0.1/dist/js/spreadsheet.js"></script>

<div id="test"></div>
```

```javascript
<script>Spreadsheet('#test');</script>
```

## Author

- [myliang](https://github.com/myliang)
- [mypandora](https://github.com/mypandora)