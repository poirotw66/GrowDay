## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

1. Push the code to a GitHub repo (e.g. `username/GrowDay`).
2. In the repo: **Settings** → **Pages** → **Build and deployment** → **Source**: choose **GitHub Actions**.
3. Push to the `main` branch (or run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**).
4. After the workflow finishes, the app will be at:  
   **https://\<username\>.github.io/GrowDay/**  
   (Replace `username` with your GitHub username; if the repo name is different, the path matches the repo name.)
