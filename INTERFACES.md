#Chart数据接口文档

_上次修改 2017-1-10_

[TOC]

## 约定

所有接口都必须返回如下的http响应头:
Access-Control-Allow-Origin: http://chart.quchaogu.com

## 定义

* timestamp: `long` 从1970-01-01 00:00:00开始的秒数

## 通用响应属性

| name      | type               | desc           |
|:----------|:-------------------|:---------------|
| s         | 'ok' &#124; 'error'| response state |
| m         | string             | message        |

通用响应属性在后续的响应表格中将被忽略。通用响应不适用于二维码登录接口

## 初始化接口

### /chart/time

**参数列表**

无参数

**响应**

| name      | type       | desc        |
|:----------|:-----------|:------------|
| time      | timestamp  | timestamp   |

_响应例子_

    {
      s: :"ok",
      time: 1484036888
    }

## Symbol接口

### /chart/symbol/resolve

| name    | type          | optional | desc                                    |
|:--------|:--------------|:---------|:----------------------------------------|
| symbol  | string        | no       | stock\index\plate\etc code              |

**响应**

_SymbolInfo_

_type: array_

| index     | type                   | desc           |
|:----------|:-----------------------|:---------------|
| 0         | string                 | symbol code    |
| 1         | 'stock' &#124; 'index' | type           |
| 2         | string                 | description    |
| 3         | 'SH' &#124; 'SZ'       | stock exchange |

_type: json_

| name      | type       | desc        |
|:----------|:-----------|:------------|
| d         | SymbolInfo | symbol info |

_响应例子_

    {
      s: "ok",
      d: [
        "300542",
        "stock",
        "新晨科技",
        "SZ"
      ]
    }

### /chart/symbol/search

| name    | type          | optional | desc          |
|:--------|:--------------|:---------|:--------------|
| query   | string        | no       | query keyword |

**响应**

_SymbolInfo_

_type: array_

| index     | type                   | desc           |
|:----------|:-----------------------|:---------------|
| 0         | string                 | symbol code    |
| 1         | 'stock' &#124; 'index' | type           |
| 2         | string                 | description    |
| 3         | 'SH' &#124; 'SZ'       | stock exchange |

_type: json_

| name      | type         | desc        |
|:----------|:-------------|:------------|
| d         | SymbolInfo[] | symbol info |

_响应例子_

    {
      s: "ok",
      d: [
        ["300139", "stock", "晓程科技", "SZ"],
        ["300542", "stock", "新晨科技","SZ"],
        ["600505", "stock", "西昌电力","SH"],
        ["600777", "stock", "新潮能源","SH"],
        ["601155", "stock", "新城控股","SH"]
      ]
    }


## 数据Bar接口

### /chart/bar/history

There're 2 ways of fetching historical data.

1. if `from` & `to` are setted, all bars between will be returned.

2. if `from` & `amount` are setted, retrieve `amount` bars before `from` time.

**参数列表**

| name    | type          | optional | desc                                    |
|:--------|:--------------|:---------|:----------------------------------------|
| symbol  | string        | no       | stock\index\plate\etc code              |
| from    | timestamp     | no       | from time                               |
| to      | timestamp     | yes      | to time.`to` must be greater than `from`|
| amount  | int           | yes      | total amount                            |
| adjust  | 0 &#124; 1    | no       | 0: not adjusted, 1: forward adjusted    |


**响应**

_type: json_

| name | type                | desc                 |
|:-----|:--------------------|:---------------------|
| a    | float[]             | trading amount       |
| v    | int[]               | trading volume       |
| h    | float[]             | hightest price       |
| o    | float[]             | open price           |
| l    | float[]             | lowest price         |
| c    | float[]             | close price          |
| t    | timestamp[]         | timestamp            |
| tr   | float[]             | turnover ratio       |
| ch   | float[]             | price change ratio   |

_响应例子_

    {
      "s": "ok",
      "t": [...],
      "a": [...],
      "v": [...],
      "h": [...],
      "o": [...],
      "l": [...],
      "c": [...],
      "tr": [...],
      "ch": [...]
    }

## 复合接口

### /chart/composite/handicap

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | stock code |

**响应**

_Order_

_type: array_

| index | type   | desc   |
|:------|:-------|:-------|
| 0     | float  | price  |
| 1     | int    | volume |

_StockInfo_

_type: array_

| index | type   | desc                         |
|:------|:-------|:-----------------------------|
| 0     | float  | previous close price         |
| 1     | float  | open price                   |
| 2     | float  | highest price                |
| 3     | float  | lowest price                 |
| 4     | float  | current price                |
| 5     | float  | limit up price               |
| 6     | float  | limit down price             |
| 7     | float  | trading volume               |
| 8     | int    | trading amount (unit = yuan) |
| 9     | float  | price change rate            |
| 10    | float  | share turnover ratio         |
| 11    | int    | buy in volume                |
| 12    | int    | sell out volume              |

_TickInfo_

_type: array_

| index | type                | desc                         |
|:------|:--------------------|:-----------------------------|
| 0     | string              | time string (format: HHMMSS) |
| 1     | float               | price                        |
| 2     | int                 | volume                       |
| 3     | 1 &#124; 2 &#124; 3 | 1 stands for buying in order; 2 stands for selling out order; 3 stands for matching order |

_type: json_

| name        | type        | desc                                 |
|:------------|:------------|:-------------------------------------|
| order       | Order[10]   | 5 buy in orders &  5 sell out orders |
| stock_info  | StockInfo   | stock info                           |
| tick_list   | TickInfo[]  | tick list                            |
| i           | int         | request interval (seconds)           |

_响应例子_

    {
      s: "ok",
      order: [
        [7.25, 73000],
        [7.24, 85000],
        [7.23, 87000],
        [7.22, 21900],
        [7.21, 9600],
        [7.20, 86100],
        [7.19, 14200],
        [7.18, 36000],
        [7.17, 42400],
        [7.16, 28300] 
      ],
      stock_info: [
        7.21,
        7.19,
        7.28,
        7.16,
        7.21,
        7.34,
        7.04,
        5890000,
        43000000,
        1.66,
        0.68,
        21047,
        30522
      ],
      sick_list: [
        ["150000", 7.21, 49700, 1],
        ["145650", 7.20, 36800, 2],
        ["145635", 7.21, 500, 2],
        ["145610", 7.22, 6200, 1],
        ...
      ],
      i: 3600
    }

### /chart/composite/capitalflow

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | stock code |

**响应**

_CapitalFlowInfo_

_type: array_

| index     | type    | desc                          |
|:----------|:--------|:------------------------------|
| 0         | int     | retail investor  funds in     |
| 1         | int     | retail investor  funds out    |
| 2         | int     | leading investor funds in     |
| 3         | int     | leading investor funds out    |

_type: json_

| name      | type               | desc                       |
|:----------|:-------------------|:---------------------------|
| d         | CapitalFlowInfo[5] | capital flow info          |
| i         | int                | request interval (seconds) |

_响应例子_

    {
      s: "ok",
      d: [
        [47219628, 46219448, 11126769, 12126949],
        [47219628, 46219448, 11126769, 12126949],
        [47219628, 46219448, 11126769, 12126949],
        [47219628, 46219448, 11126769, 12126949],
        [47219628, 46219448, 11126769, 12126949]
      ],
      i: 3600
    }

### /chart/composite/indexes

**参数列表**

无参数

**响应**

_IndexInfo_

_type: array_

| index | type   | desc               |
|:------|:-------|:-------------------|
| 0     | string | stock index code   |
| 1     | string | stock index name   |
| 1     | float  | price change ratio |
| 2     | float  | price              |
| 3     | float  | price change       |

_type: json_

| name      | type       | desc                       |
|:----------|:-----------|:---------------------------|
| d         | IndexInfo[]| indexes info               |
| i         | int        | request interval (seconds) |

_响应例子_

    {
      s: "ok",
      d: [
        ["sh000001", "上证指数", 0.54, 3171.24, 16.92],
        ["sz399001", "深证成指", 0.41, 10331.79, 42.43],
        ["sz399005", "沪深300", 0.41, 6546.61, 26.56],
        ["sz399006", "中小板指", -0.17, 1961.62, -3.41],
        ["sz399300", "创业板指", 0.48, 3363.90, 16.23]
      ],
      i: 3600
    }

### /chart/composite/realtimetool

**参数列表**

无参数

**响应**

_RealtimeTool_

_type: array_

| name | type   | desc                                                   |
|:-----|:-------|:-------------------------------------------------------|
| 0    | int    | Capital flow of Shanghai-HongKong Stock Connect Program. Negtive number means flowing out |
| 1    | int    | Amount of stocks whose value fluctuate fiercely. Negtive number means sharp moveing down  |
| 2    | int    | Amount of stocks whose value goes up by 5%             |
| 3    | int    | Amount of stocks whose value goes down by 5%           |

_type: json_

| name      | type          | desc                       |
|:----------|:--------------|:---------------------------|
| d         | RealtimeTool[]| indexes info               |
| i         | int           | request interval (seconds) |

_响应例子_

    {
      s: "ok",
      d: [-217000000, 60, 85, 22],
      i: 3600
    }

### /chart/composite/nonrealtimetool

**参数列表**

无参数

**响应**

_ToolData_

_type: array_

| index | type   | desc                                  |
|:------|:-------|:--------------------------------------|
| 0     | float  | pressure of SCI                       |
| 1     | float  | support of SCI                        |
| 2     | int    | central bank funds (unit = yuan)      |
| 3     | int    | unlocked market value (unit = yuan)   |
| 4     | int    | financing funds (unit = yuan)         |
| 5     | int    | financing funds change (unit = yuan)  |
| 6     | int    | institutional funds (unit = yuan)     |
| 7     | int    | investors funds (unit = yuan)         |
| 8     | int    | amount of new investors               |
| 9     | int    | amount of trading investors           |
| 10    | int    | search popularity                     |
| 11    | int    | forum popularity                      |

_type: json_

| name      | type         | desc                       |
|:----------|:-------------|:---------------------------|
| d         | ToolData     | non realtime tools         |

_响应例子_

    {
      s: "ok",
      d: [
        3190,
        3150,
        70000000000,
        22587000000,
        929450000000,
        3450000000,
        185000000,
        65300000000,
        31260000,
        14778700,
        448100,
        666000
      ]
    }

### /chart/composite/financing

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | stock code |

**响应**

_FinancialData_

_type: array_

| index | type   | desc                                 |
|:------|:-------|:-------------------------------------|
| 0     | float  | earnings per share (unit = yuan)     |
| 1     | int    | net income (unit = yuan)             |
| 2     | float  | net income growth rate               |
| 3     | int    | revenue (unit = yuan)                |
| 4     | float  | revenue growth rate                  |
| 5     | float  | net value per share (unit = yuan)    |
| 6     | float  | return on equity                     |
| 7     | float  | return on equity dilution            |
| 8     | float  | asset/liability ratio                |
| 9     | float  | capital reserve per share            |
| 10    | float  | undistributed profit per share       |
| 11    | float  | operating cash flow per share        |
| 12    | int    | operating cashflow in (unit = yuan)  |
| 13    | int    | operating cashflow out (unit = yuan) |
| 14    | int    | net operating cashflow (unit = yuan) |
| 15    | float  | current ratio                        |
| 16    | float  | quick ratio                          |

_type: json_

| name      | type         | desc                       |
|:----------|:-------------|:---------------------------|
| d         | FinancialData| indexes info               |

_响应例子_

    {
      s: "ok",
      d: [
        0.14,
        10000000,
        33.13,
        269000000,
        -0.35,
        5.97,
        2.18,
        1.8,
        19.01,
        2.21,
        2.39,
        -1.22,
        242000000,
        352000000,
        -110000000,
        4.43,
        4.05
      ]
    }

## 板块接口

### /chart/plate/list

if code is omited, return all plates

**参数列表**

| name    | type          | optional  | desc        |
|:--------|:--------------|:----------|:------------|
| code    | string        | yes       | stock code  |

**响应**

Plate

_type: array_

| name | type         | desc                                   |
|:-----|:-------------|:---------------------------------------|
| 0    | string       | plate name                             |
| 1    | float        | plate index change rate                |
| 2    | int          | main funds (unit = yuan)               |
| 3    | float        | proportion of big order                |
| 4    | int          | amount of stocks whose value goes up   |
| 5    | int          | amount of stocks whose value goes down |

_type: json_

| name       | type         | desc            |
|:-----------|:-------------|:----------------|
| concept    | Plate[]      | concept plates  |
| industry   | Plate[]      | industry blocks |


_sample resposne_

    {
      s: "ok",
      d: [
        ["次新股"],
        ["软件开发"]
      ]
    }

### /chart/plate/stocks

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| plate   | string        | no       | plate name |

**响应**

_StockInfo_

_type: array_

| index | type   | desc           |
|:------|:-------|:---------------|
| 0     | string | stock code     |
| 1     | string | stock name     |
| 2     | float  | price change   |
| 3     | float  | previous close |
| 4     | float  | price          |

_type: json_

| name      | type         | desc        |
|:----------|:-------------|:------------|
| d         | StockInfo[]  | stocks info |

_响应例子_

    {
      s: "ok",
      d: [
        ["300377", "赢时胜", 6.46, 36.4, 38.75],
        ["002405", "四维图新", 3.11, 19.63, 20.24],
        ["300465", "高伟达", 1.97, 18.24, 18.6],
        ...
      ]
    }

## 用户接口

## 二维码登录接口

### qrcodelogin/getqrcode

**参数列表**

无参数

**响应**

| name      | type                | desc                           |
|:----------|:--------------------|:-------------------------------|
| state     | 'ok' &#124;' error' | response state                 |
| url       | string              | QR code image url              |
| token     | string              | token for checking login state |

_响应例子_

    {
      state: "ok",
      url: "http://xxx.quchaogu.com/xxx/xxx.png",
      token: "b6ca73b01823381746cb02c14b052030"
    }

### qrcodelogin/checklogin

**参数列表**

| name    | type   | optional | desc       |
|:--------|:-------|:---------|:-----------|
| token   | string | no       | token received from '/qrcodelogin/getqrcode' interface |

**响应**

| name      | type                 | desc                                 |
|:----------|:---------------------|:-------------------------------------|
| state     | 'ok' &#124; ' error' | response state                       |
| code      | 1 &#124; 2 &#124; 3  | 1 stands for waiting for login; 2 stands for login passed; 3 stands for timeout |

_响应例子_

    {
      state: "ok",
      code: 2
    }




