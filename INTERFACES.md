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

根据code获取symbol的详细信息

| name    | type          | optional | desc                                    |
|:--------|:--------------|:---------|:----------------------------------------|
| code    | string        | no       | stock\index\plate\etc code              |

**响应**

_SymbolInfo_

_type: array_

| index     | type                   | desc           |
|:----------|:-----------------------|:---------------|
| 0         | string                 | symbol code    |
| 1         | 'stock' &#124; 'index' | type           |
| 2         | string                 | description    |
| 3         | 'SH' &#124; 'SZ'       | 交易所          |

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

根据关键字检索symbol列表

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
| 3         | 'SH' &#124; 'SZ'       | 交易所          |

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

有两种方式请求数据bar接口。

1. 如果设置了`from`和`to`，所有在此之间的数据bar都返回。

2. 如果设置了`from`和`amount`，尽可能地获取在`from`时间之前的`amount`个数据bar。

**参数列表**

| name    | type          | optional | desc                                    |
|:--------|:--------------|:---------|:----------------------------------------|
| symbol  | string        | no       | stock\index\plate\etc code              |
| from    | timestamp     | no       | from time                               |
| to      | timestamp     | yes      | to time.`to` 必须大于 `from`             |
| amount  | int           | yes      | 请求数量                                 |
| adjust  | 0 &#124; 1    | no       | 0: 不复权, 1: 前复权                      |


**响应**

_type: json_

| name | type                | desc                 |
|:-----|:--------------------|:---------------------|
| a    | float[]             | 成交额                |
| v    | int[]               | 成交量                |
| h    | float[]             | 最高价                |
| o    | float[]             | 开盘价                |
| l    | float[]             | 最低价                |
| c    | float[]             | 收盘价                |
| t    | timestamp[]         | 时间戳                |
| tr   | float[]             | 换手率                |
| ch   | float[]             | 涨跌幅                |

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

## 复合数据接口

### /chart/composite/handicap

盘口数据：五档盘口，实时股票信息，逐笔交易

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | 股票代码    |

**响应**

_Order_

_type: array_

| index | type   | desc   |
|:------|:-------|:-------|
| 0     | float  | 价格    |
| 1     | int    | 成交量  |

_StockInfo_

_type: array_

| index | type   | desc                         |
|:------|:-------|:-----------------------------|
| 0     | float  | 前日收盘价                    |
| 1     | float  | 开盘价                        |
| 2     | float  | 最高价                        |
| 3     | float  | 最低价                        |
| 4     | float  | 当前价                        |
| 5     | float  | 涨停价                        |
| 6     | float  | 跌停价                        |
| 7     | float  | 成交量                        |
| 8     | int    | 成交额 (单位 = 元)             |
| 9     | float  | 涨跌幅                        |
| 10    | float  | 换手率                        |
| 11    | int    | 内盘                         |
| 12    | int    | 外盘                         |

_TickInfo_

_type: array_

| index | type                | desc                         |
|:------|:--------------------|:-----------------------------|
| 0     | string              | 时间串 (format: HHMMSS)       |
| 1     | float               | 价格                          |
| 2     | int                 | 成交量                        |
| 3     | 1 &#124; 2 &#124; 3 | 1 主买; 2 主卖; 3 撮合         |

_type: json_

| name        | type        | desc                                 |
|:------------|:------------|:-------------------------------------|
| order       | Order[10]   | 5档买单和5档卖单                       |
| stock_info  | StockInfo   | stock info                           |
| tick_list   | TickInfo[]  | 逐笔列表                              |
| i           | int         | 请求间隔 (秒)                          |

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

资金流向

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | 股票代码    |

**响应**

_CapitalFlowInfo_

_type: array_

| index     | type    | desc   |
|:----------|:--------|:-------|
| 0         | int     | 散户流入 |
| 1         | int     | 散户流出 |
| 2         | int     | 主力流入 |
| 3         | int     | 主力流出 |

_type: json_

| name      | type               | desc       |
|:----------|:-------------------|:-----------|
| d         | CapitalFlowInfo[5] | 资金流向     |
| i         | int                | 请求间隔 (秒)|

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

股指信息

**参数列表**

无参数

**响应**

_IndexInfo_

_type: array_

| index | type   | desc    |
|:------|:-------|:--------|
| 0     | string | 股指代码 |
| 1     | string | 股指名称 |
| 1     | float  | 涨跌幅   |
| 2     | float  | 当前价   |
| 3     | float  | 涨跌     |

_type: json_

| name      | type       | desc        |
|:----------|:-----------|:------------|
| d         | IndexInfo[]| 股指信息     |
| i         | int        | 请求间隔 (秒) |

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

实时工具

**参数列表**

无参数

**响应**

_RealtimeTool_

_type: array_

| name | type   | desc                         |
|:-----|:-------|:-----------------------------|
| 0    | int    | 沪股通资金流向。 负数表示流出    |
| 1    | int    | 急涨急跌股票数量。 负数表示净急跌 |
| 2    | int    | 涨幅5%以上的股票数量            |
| 3    | int    | 跌幅5%以上的股票数量            |

_type: json_

| name      | type          | desc        |
|:----------|:--------------|:------------|
| d         | RealtimeTool[]| 实时工具信息  |
| i         | int           | 请求间隔 (秒) |

_响应例子_

    {
      s: "ok",
      d: [-217000000, 60, 85, 22],
      i: 3600
    }

### /chart/composite/nonrealtimetool

非实时工具

**参数列表**

无参数

**响应**

_ToolData_

_type: array_

| index | type   | desc                  |
|:------|:-------|:----------------------|
| 0     | float  | 沪指压力               |
| 1     | float  | 沪指支撑               |
| 2     | int    | 央行资金 (单位 = 元)    |
| 3     | int    | 解禁市值 (单位 = 元)    |
| 4     | int    | 融资余额 (单位 = 元)    |
| 5     | int    | 融资余额涨跌 (单位 = 元)|
| 6     | int    | 机构资金 (单位 = 元)    |
| 7     | int    | 投资者资金 (单位 = 元)  |
| 8     | int    | 新增投资者             |
| 9     | int    | 交易投资者             |
| 10    | int    | 搜索人气               |
| 11    | int    | 股吧人气               |

_type: json_

| name      | type         | desc     |
|:----------|:-------------|:---------|
| d         | ToolData     | 非实时工具 |

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

财务数据

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| code    | string        | no       | 股票代码    |

**响应**

_FinancialData_

_type: array_

| index | type   | desc                   |
|:------|:-------|:-----------------------|
| 0     | float  | 每股收益 (单位 = 元)     |
| 1     | int    | 净利润 (单位 = 元)       |
| 2     | float  | 近利润增长率             |
| 3     | int    | 营业总收入 (单位 = 元)    |
| 4     | float  | 总收入增长率             |
| 5     | float  | 每股净资产 (单位 = 元)    |
| 6     | float  | 净资产收益率             |
| 7     | float  | 净资产收益率摊薄          |
| 8     | float  | 资产负债比               |
| 9     | float  | 每股资本公积金           |
| 10    | float  | 每股未分配利润           |
| 11    | float  | 每股经营现金流           |
| 12    | int    | 经营现金流入 (单位 = 元)  |
| 13    | int    | 经营现金流出 (单位 = 元)  |
| 14    | int    | 经营现金流净额 (单位 = 元)|
| 15    | float  | 流动比率                |
| 16    | float  | 速动比率                |

_type: json_

| name      | type         | desc    |
|:----------|:-------------|:--------|
| d         | FinancialData| 财务数据 |

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

板块列表

if code is omited, return all plates

**参数列表**

| name    | type          | optional  | desc        |
|:--------|:--------------|:----------|:------------|
| code    | string        | yes       | 股票代码     |

**响应**

Plate

_type: array_

| name | type         | desc              |
|:-----|:-------------|:------------------|
| 0    | string       | 板块名称           |
| 1    | float        | 扳指涨跌幅          |
| 2    | int          | 主力资金 (单位 = 元)|
| 3    | float        | 大单净比           |
| 4    | int          | 上涨数             |
| 5    | int          | 下跌书             |

_type: json_

| name       | type         | desc        |
|:-----------|:-------------|:------------|
| concept    | Plate[]      | 概念板块     |
| industry   | Plate[]      | 行业板块     |
| i          | int          | 请求间隔 (秒) |

_sample resposne_

    {
      s: "ok",
      concept: [
        ["次新股", 2.31, 85900000, 17.33, 4, 1],
        ["次新股", 2.31, 85900000, 17.33, 4, 1]
      ],
      industry: [
        ["软件开发", 2.31, 85900000, 17.33, 4, 1],
        ["软件开发", 2.31, 85900000, 17.33, 4, 1]
      ],
      i: 3600
    }

### /chart/plate/stocks

板块下的股票

**参数列表**

| name    | type          | optional | desc       |
|:--------|:--------------|:---------|:-----------|
| plate   | string        | no       | 版块名称    |

**响应**

_StockInfo_

_type: array_

| index | type   | desc     |
|:------|:-------|:---------|
| 0     | string | 股票代码  |
| 1     | string | 股票名称  |
| 2     | float  | 涨跌      |
| 3     | float  | 前日收盘价 |
| 4     | float  | 最新价    |

_type: json_

| name      | type         | desc        |
|:----------|:-------------|:------------|
| d         | StockInfo[]  | 股票列表     |
| i         | int          | 请求间隔 (秒) |

_响应例子_

    {
      s: "ok",
      d: [
        ["300377", "赢时胜", 6.46, 36.4, 38.75],
        ["002405", "四维图新", 3.11, 19.63, 20.24],
        ["300465", "高伟达", 1.97, 18.24, 18.6],
        ...
      ],
      i: 3600
    }

## 用户接口

## 二维码登录接口

### /qrcodelogin/getqrcode

获取二维码

**参数列表**

无参数

**响应**

| name      | type                | desc           |
|:----------|:--------------------|:---------------|
| state     | 'ok' &#124;' error' | response state |
| url       | string              | 二维码图片地址   |
| token     | string              | token          |

_响应例子_

    {
      state: "ok",
      url: "http://xxx.quchaogu.com/xxx/xxx.png",
      token: "b6ca73b01823381746cb02c14b052030"
    }

### /qrcodelogin/checklogin

询问二维码登录是否通过

**参数列表**

| name    | type   | optional | desc       |
|:--------|:-------|:---------|:-----------|
| token   | string | no       | token received from '/qrcodelogin/getqrcode' interface |

**响应**

| name      | type                 | desc                         |
|:----------|:---------------------|:-----------------------------|
| state     | 'ok' &#124; ' error' | response state               |
| code      | 1 &#124; 2 &#124; 3  | 1: 未登录; 2: 登录成功; 3: 超时 |

_响应例子_

    {
      state: "ok",
      code: 2
    }




