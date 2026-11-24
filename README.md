# A little love note

A responsive date invitation made with plain HTML, CSS, and JavaScript.

## Run locally

From this folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173.

## Make it yours

Edit the greeting, invitation, and signature in `index.html`. Change the colors in `style.css`. Date options and invitation copy are in `index.html`. The copied reply is assembled in `script.js` from the selected plan and her optional comments. Answers are only shown in the browser; nothing is sent or stored. The recipient can copy their answer and send it to you.

## Deploy later on Vercel

Upload this folder to your personal GitHub repository and import it into Vercel. Select Other as the framework, leave the build command empty, and use the repository root as the output directory. No dependencies or environment variables are needed.

Fonts load from Google Fonts with local serif and sans-serif fallbacks.
# date-invitation
