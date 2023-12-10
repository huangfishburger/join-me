# hw3

## Running the app

1. Install dependencies

```bash
yarn install
```

2. Create a `.env.local` file in the root of the project and add a _valid_ Postgres URL. To get a Postgres URL, follow the instructions [here](https://ric2k1.notion.site/Free-postgresql-tutorial-f99605d5c5104acc99b9edf9ab649199?pvs=4).

This is just an example, you should replace the URL with your own.

```bash
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/twitter"
```

3. Run the migrations

```bash
yarn migrate
```

4. Start the app

```bash
yarn dev
```

## Perfect
使用者點選「我想參加」後，可以在活動頁面點擊（或利用其他操作方式，如拖曳）選擇自己有空的時段，並可以檢視哪些時段有多少人可以參加。