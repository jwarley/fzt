# fzt

Quickly switch between tabs using only the keyboard by fuzzy-searching over the tabs' title text, analogous to what [fzf](https://github.com/junegunn/fzf) provides for files.

Status: Definitely usable but still in development; requires manual installation.

Default shortcut: Ctrl + e

### Try it out
1. Clone the repo.
2. Browse to `about:debugging`.
3. Select *This Firefox* on the left-hand menu.
4. Click *Load Temporary Add-on...*.
5. Select the `manifest.json` file from the repo.

### Match semantics (to be improved)
"Fuzzy search" sometimes implies robustness against typos and sometimes does not.
The fzt search matches only strings that contain the query as a literal subsequence; e.g. "the" will match "**the**m" and "one **t**wo t**h**r**e**e" but will not match "teh". 
Also, fzt is currently not as intelligent about ranking matches as fzf is.
Results are sorted by longest match, without regard for other heuristics, e.g. how early a match occurs or how long the non-maximum matches are.
