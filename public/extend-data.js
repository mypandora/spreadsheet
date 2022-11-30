const EXTEND_DATA = {
  name: '扩展类型测试',
  freeze: 'B3',
  styles: [
    {
      bgcolor: '#f4f5f8',
      textwrap: true,
      color: '#900b09',
      border: {
        top: ['thin', '#0366d6'],
        bottom: ['thin', '#0366d6'],
        right: ['thin', '#0366d6'],
        left: ['thin', '#0366d6'],
      },
    },
    {
      strike: true,
    },
  ],
  merges: ['C3:D4'],
  rows: {
    0: {
      cells: {
        1: {
          text: '',
          type: 'image',
          value:
            'https://www.techadvisor.com/wp-content/uploads/2022/06/howtogetexcelforfree1.png?resize=1024%2C538&quality=50&strip=all',
        },
        2: {
          text: '"><img src=1 onerror=debugger;>',
          type: 'text',
        },
      },
    },
    1: {
      cells: {
        0: {
          text: '',
          value: 1,
          type: 'select',
          selectAsync: false, // 是否异步，true表示异步；当数据太多时，选择异步，只保存接口，在移动端使用时再调用相应的接口
          selectFilterable: true, // 可搜索
          selectInterface: '', // 异步时的接口
          selectOptions: [
            { label: '测试一', value: 1 },
            { label: '测试二', value: 2 },
            { label: '测试三', value: 3 },
          ], // 下拉框数据，同步数据
          selectLinkId: 'aaatest',
        },
        2: {
          text: 'testing',
          type: 'radio',
          checked: false,
        },
        3: {
          text: '单选框测试',
          type: 'radio',
        },
        4: {
          text: '2',
          type: 'checkbox',
        },
        5: {
          componentId: 'aaatest',
        },
      },
    },
    2: {
      cells: {
        0: {
          text: 'render',
          style: 1,
        },
        1: {
          text: 'Hello',
        },
        2: {
          text: 'haha',
          merge: [1, 1],
        },
        11: {
          text: '4',
          type: 'checkbox',
          checked: false,
        },
      },
    },
    4: {
      cells: {
        1: {
          componentIdmponentIdmponentIdmponentIdmponentIdmponentIdmponentIdmponentIdmponentId: 2111,
          text: '你的身份？',
          group: 'checkbox1',
        },
        2: {
          componentId: 2112,
          type: 'checkbox',
          text: '穷人',
          group: 'checkbox1',
          value: 111,
        },
        3: {
          componentId: 2113,
          type: 'checkbox',
          text: '富人',
          group: 'checkbox1',
        },
        4: {
          componentId: 2114,
          type: 'checkbox',
          text: '中间人',
          group: 'checkbox1',
        },
        5: {
          componentId: 2115,
          type: 'checkbox',
          text: '其他',
          group: 'checkbox1',
        },
        6: {
          componentId: 2116,
          type: 'checkbox',
          text: '不知道',
          group: 'checkbox1',
        },
        7: {
          componentId: 2117,
          type: 'checkbox',
          text: '不想说',
          group: 'checkbox1',
        },
        8: {
          componentId: 2118,
          type: 'checkbox',
          text: '你也配姓赵？',
          group: 'checkbox1',
        },
      },
    },
    5: {
      cells: {
        1: {
          componentId: 3111,
          text: '你的身份？',
          group: 'checkbox11',
        },
        2: {
          componentId: 3112,
          type: 'checkbox',
          text: '穷人',
          group: 'checkbox11',
        },
        3: {
          componentId: 3113,
          type: 'checkbox',
          text: '富人',
          group: 'checkbox11',
        },
        4: {
          componentId: 3114,
          type: 'checkbox',
          text: '中间人',
          group: 'checkbox11',
        },
        5: {
          componentId: 3115,
          type: 'checkbox',
          text: '其他',
          group: 'checkbox11',
        },
        6: {
          componentId: 3116,
          type: 'checkbox',
          text: '不知道',
          group: 'checkbox11',
        },
        7: {
          componentId: 3117,
          type: 'checkbox',
          text: '不想说',
          group: 'checkbox11',
        },
        8: {
          componentId: 3118,
          type: 'checkbox',
          text: '你也配姓赵？',
          group: 'checkbox11',
        },
      },
    },
    6: {
      cells: {
        1: {
          componentId: 111,
          text: '你的身份？',
          group: 'identity',
        },
        2: {
          componentId: 112,
          type: 'radio',
          text: '穷人',
          group: 'identity',
        },
        3: {
          componentId: 113,
          type: 'radio',
          text: '富人',
          group: 'identity',
        },
        4: {
          componentId: 114,
          type: 'radio',
          text: '中间人',
          group: 'identity',
        },
        5: {
          componentId: 115,
          type: 'radio',
          text: '其他',
          group: 'identity',
        },
        6: {
          componentId: 116,
          type: 'radio',
          text: '不知道',
          group: 'identity',
        },
        7: {
          componentId: 117,
          type: 'radio',
          text: '不想说',
          group: 'identity',
        },
        8: {
          componentId: 118,
          type: 'radio',
          text: '你也配姓赵？',
          group: 'identity',
        },
      },
    },
    7: {
      cells: {
        1: {
          componentId: 1111,
          text: '你的身份？',
          group: 'copy',
        },
        2: {
          componentId: 1112,
          type: 'radio',
          text: '穷人',
          group: 'copy',
        },
        3: {
          componentId: 1113,
          type: 'radio',
          text: '富人',
          group: 'copy',
        },
        4: {
          componentId: 1114,
          type: 'radio',
          text: '中间人',
          group: 'copy',
        },
        5: {
          componentId: 1115,
          type: 'radio',
          text: '其他',
          group: 'copy',
        },
        6: {
          componentId: 1116,
          type: 'radio',
          text: '不知道',
          group: 'copy',
        },
        7: {
          componentId: 1117,
          type: 'radio',
          text: '不想说',
          group: 'copy',
        },
        8: {
          componentId: 1118,
          type: 'radio',
          text: '你也配姓赵？',
          group: 'copy',
        },
      },
    },
    8: {
      cells: {
        1: {
          componentId: 1, // 唯一标识
          text: '', // 单元格值，用于显示
          value: '', // 单元格值，用于保存
          type: 'select', // 单元格类型
          selectAsync: true, // 是否异步，true表示异步；当数据太多时，选择异步，只保存接口，使用时调用相应的接口
          selectInterface: 'meta/catalogItem/api/front/treeList', // 异步时的接口
          selectMethod: 'POST', // 异步时的接口方法
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }], // 需要传递的参数
          selectProps: { label: 'label', value: 'label' }, // 在这里把id的值作为本单元格value的值，以便其它级联单元格使用
          selectParentId: null, // 级联的父级id
          selectParentValue: null, // 级联的父级value，主要是为了回显使用
          selectLinkId: 8, // 表示级联的单元格id
          selectValue: '110000000000',
        },
        2: {
          componentId: 2,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [
            { key: 'catalogId', value: '1544562149193850882' },
            { key: 'parentItemCode' }, // 值取父级单元格的value
          ],
          selectProps: { label: 'value', value: 'value' },
          selectParentId: 1,
          selectParentValue: null,
          selectParentKey: 'selectValue',
          selectLinkId: 8,
        },
        3: {
          componentId: 3,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label&value', value: 'value' },
          selectParentId: 2,
          selectParentValue: null,
          selectLinkId: 8,
        },
        4: {
          componentId: 4,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 3,
          selectParentValue: null,
          selectLinkId: 8,
        },
        5: {
          componentId: 5,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 4,
          selectParentValue: null,
          selectLinkId: 8,
        },
        8: {
          componentId: 8,
          text: '',
        },
      },
    },
    9: {
      cells: {
        1: {
          componentId: 11, // 唯一标识
          text: '', // 单元格值，用于显示
          value: '', // 单元格值，用于保存
          type: 'select', // 单元格类型
          selectAsync: true, // 是否异步，true表示异步；当数据太多时，选择异步，只保存接口，使用时调用相应的接口
          selectInterface: 'meta/catalogItem/api/front/treeList', // 异步时的接口
          selectMethod: 'POST', // 异步时的接口方法
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }], // 需要传递的参数
          selectProps: { label: 'label', value: 'value' }, // 在这里把id的值作为本单元格value的值，以便其它级联单元格使用
          selectParentId: null, // 级联的父级id
          selectParentValue: null, // 级联的父级value，主要是为了回显使用
          selectLinkId: 18, // 表示级联的单元格id
        },
        2: {
          componentId: 12,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [
            { key: 'catalogId', value: '1544562149193850882' },
            { key: 'parentItemCode' }, // 值取父级单元格的value
          ],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 11,
          selectParentValue: null,
          selectLinkId: 18,
        },
        3: {
          componentId: 13,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 12,
          selectParentValue: null,
          selectLinkId: 18,
        },
        4: {
          componentId: 14,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 13,
          selectParentValue: null,
          selectLinkId: 18,
        },
        5: {
          componentId: 15,
          text: '',
          type: 'select',
          selectAsync: true,
          selectInterface: 'meta/catalogItem/api/front/treeList',
          selectMethod: 'POST',
          selectParams: [{ key: 'catalogId', value: '1544562149193850882' }, { key: 'parentItemCode' }],
          selectProps: { label: 'label', value: 'value' },
          selectParentId: 14,
          selectParentValue: null,
          selectLinkId: 18,
        },
        8: {
          componentId: 18,
          text: '',
        },
      },
    },
    10: {
      cells: {
        2: {
          type: 'date',
        },
        3: {
          text: '数字框(默认)',
        },
        4: {
          text: 0,
          type: 'number',
          numberMin: 0, // 数字最小值
          numberMax: Infinity, // 数字最大值
          numberNeg: false, // 数字可为负
          numberFP: false, // 数字可为浮点数
          numberSig: 2, // 数字小数精度
        },
        6: {
          text: '文本框',
        },
      },
    },
    11: {
      cells: {
        0: {
          type: 'data',
          text: '测试隐藏',
          hidden: true,
        },
        2: {
          type: 'date',
        },
        3: {
          text: '数字框(可负数)',
        },
        4: {
          text: 222,
          type: 'number',
          numberMin: -Infinity, // 数字最小值
          numberMax: Infinity, // 数字最大值
          numberNeg: true, // 数字可为负
          numberFP: false, // 数字可为浮点数
          numberSig: 2, // 数字小数精度
        },
      },
    },
    12: {
      cells: {
        2: {
          type: 'date',
        },
        3: {
          text: '数字框(可浮点，2位精度)',
        },
        4: {
          type: 'number',
          numberMin: 0, // 数字最小值
          numberMax: Infinity, // 数字最大值
          numberNeg: false, // 数字可为负
          numberFP: true, // 数字可为浮点数
          numberSig: 2, // 数字小数精度
        },
      },
    },
    13: {
      cells: {
        2: {
          type: 'date',
        },
        3: {
          text: '数字框(可负可浮点，2位精度)',
        },
        4: {
          type: 'number',
          numberMin: -Infinity, // 数字最小值
          numberMax: Infinity, // 数字最大值
          numberNeg: true, // 数字可为负
          numberFP: true, // 数字可为浮点数
          numberSig: 2, // 数字小数精度
        },
      },
    },
    14: {
      cells: {
        2: {
          type: 'date',
        },
        3: {
          text: 'cell-text',
        },
      },
    },
    15: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    16: {
      cells: {
        2: {
          type: 'date',
        },
        3: {
          text: '4',
        },
      },
    },
    17: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    18: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    19: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    20: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    21: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    22: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    23: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    24: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    25: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    26: {
      cells: {
        2: {
          type: 'date',
        },
      },
    },
    len: 80,
  },
  cols: {
    2: {
      width: 200,
    },
    3: {
      width: 200,
    },
    len: 10,
  },
  validations: [
    {
      refs: ['C11:C27'],
      mode: 'cell',
      type: 'date',
      required: false,
      operator: 't',
      value: '',
    },
  ],
  autofilter: {},
  extra: {},
};

export default EXTEND_DATA;
