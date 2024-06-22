## Setup

- Clone this repository
- Make sure you've **Node v20** installed on your machine.
- Create `.env.local` file in the root directory and set `GITHUB_PAT` environment variable. `GITHUB_PAT` is GitHub's "personal access token" which can be obtained from GitHub's settings.
- In the root directory, run `npm install` command to install the dependencies.
- Run `npm run dev` command to run dev server.

## TODO

- [x] Setup Svelte
- [x] Setup Fabric
- [x] Setup Data Fetching from GitHub
- [x] Implement Search
- [x] Create Card
  - [x] Basic Card
  - [x] Has Image?
  - [x] Has Username?
  - [x] Has Name?
  - [x] Click should open the profile
  - [x] Alt + drag should drag the card
  - [x] Implement Hover
- [x] Make everything responsive
- [x] Zoom and Pan
- [x] Ctrl + S exports the card as images
  - [x] Show them in a sidebar as a vertical list

Bonus:

- [x] Smooth animations for delight
