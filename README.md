# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

### 1. Configure Firebase Credentials

This project requires Firebase credentials to connect to the database.

1.  Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```
2.  Open the newly created `.env.local` file.
3.  Follow the instructions in the file to add your Firebase project's public configuration and private service account key.

### 2. Run the Development Server

Once your credentials are in place, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
