# Web API

## サーバー情報取得

* GET `/api/server`
* クエリパラメータ なし
* 返り値の例
  ```json
  {
    "server": {
      "type": "paper",
      "version": "1.18.2",
      "build": 234
    },
    "state": "RUNNING",
  }
  ```


## サーバーログ取得

* GET `/api/server/log`
* クエリパラメータ なし
* 返り値の例
  ```json
  [
    "...",
    "...",
    "..."
  ]
  ```

## サーバーインストール

* POST `/api/server/log`
* ボディ
  * type?: string
    * サーバーの種類。paper以外は指定できない
  * version: string
    * Minecraft バージョン
  * build: number
    * ビルド番号
  * file: string
    * ファイル名
* 返り値 なし

## サーバー起動

* POST `/api/server/start`
* ボディ なし
* 返り値 なし

## サーバー停止

* POST `/api/server/stop`
* ボディ なし
* 返り値 なし

## サーバーコマンド実行

* POST `/api/server/stop`
* ボディ
  * command: string
    * コマンド文字列
* 返り値 なし
