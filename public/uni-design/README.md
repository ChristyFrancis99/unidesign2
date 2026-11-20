# UnI Design Group website

Open `index.html` with a local web server so the walkthrough can load and seek correctly. From this folder, run either `npx serve .`, or start VS Code Live Server from `index.html`.

The contact form currently prepares an email to `studio@example.com`. Replace the `CONTACT_EMAIL` constant at the top of `script.js` with the studio's preferred address.

To swap the walkthrough, replace the MP4 path on the `<source>` element in `index.html` and the poster path on the video and still-image elements. Update `DESKTOP_PIN_VIEWPORTS` and `MOBILE_PIN_VIEWPORTS` at the top of `script.js` to change the scroll distance. GSAP, ScrollTrigger, Lenis and the Google Fonts are loaded from their CDNs, so a network connection is needed.