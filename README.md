# priceIt
# Dependency Setup
- Download Expo Go on your phone
- Go to: https://ngrok.com/downloads/windows
- Create an account (for API token)
- Install ngrok onto your computer using `chocolatey`
- A terminal will open, inside of it run: `ngrok config add-authtoken <token>` and replace <token> with your own. 
# Setup
- Extract the project
- Double click the solution file in the `/backend/` folder and open in Visual Studio
- Select the solution named `priceItBackend` on the right
- In the top left, select Project -> priceItBackendProperties
- In the tab on the left, go to Debug, then click `Open debug launch profiles UI`
- Add the downloaded file's path as an environment variable called `GOOGLE_APPLICATION_CREDENTIALS`.
- Example: `C:\Users\yourname\Downloads\ultra-hologram-452903-f0-9a34441533df.json`
- Run the backend, a swagger UI will open in a web browser.
- Open a git bash terminal and navigate to the backend folder `priceIt/backend/FinalProjCS392/` and run the command `ngrok http 5238`
- ngrok will give you a link that looks like this one: `https://ce8b-128-197-28-168.ngrok-free.app` copy it and paste it into the `API_BASE_URL` constant in the file located at `/frontend/cs392app/app/config/apiConfig.ts`.
- In another Git Bash terminal, navigate to the frontend folder `priceIt/frontend/cs392app/` and run the command `npm install`
- In the same frontend folder, run the command `npx expo start`. Scan the QR code with your camera after installing Expo Go.

