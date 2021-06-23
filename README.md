# markdown-preview-app

## docker起動
```bash
docker-compose up --build -d
```

## docker終了
```bash
docker-compose stop
```

## 依存モジュールインストール(docker起動後)：初回のみ
```bash
docker exec -it md_prev_demo bash
npm ci
```

## DB準備
### マイグレーション：初回のみ
- up
```
npx sequelize-cli db:migrate --env {ENV}
```
- down：テーブルを削除する場合
```
npx sequelize-cli db:migrate:undo --env {ENV}
```

## node 起動
```bash
npm start
```

## サーバー起動後アクセス
- Index  
http:localhost:8080
- ユーザー管理  
http:localhost:8080/users
- ログイン
http:localhost:8080/users/login
