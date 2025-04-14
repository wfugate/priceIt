# priceIt

## Dependencies
### Backend
- Go to: https://ngrok.com/downloads/windows
- Create an account (for API token)
- Install ngrok onto your computer using `chocolatey` or download exe file
-  Extract zip file
-  Open your terminal and cd into the extracted folder
-  Run: `ngrok config add-authtoken <token>` and replace <token> with your own
-  Run: `ngrok http 5238`

- You have to redo this process every time you reset your computer

### Frontend
- run: `npm install`
- run: `npm install expo`

## How to run
### When in the backend directory
- run `ngrok http 5238` --> ngrok will give you a link that looks similar to this: `https://40ad-128-197-28-159.ngrok-free.app/`
- Change all links in `(tabs)index.tsx` and scan `services/scanService.ts`

### When in the frontend directory
- run: `npm install`
- cd into `cs392app`
- run: `npm expo start`
