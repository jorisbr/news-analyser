A chrome extension for online news article feedback.

More information found [here](https://wild-merrill-no-name-org-420b310d.koyeb.app/)

Checkout the extenion in the Chrome store [here](https://chromewebstore.google.com/detail/news-analyser/ffpihdhnicdfjbjghbeabcjjmfgalafp)

Development:
`npm run watch`

Release:
1. `npx webpack --config webpack.config.js --mode production --output-path release`
2. Move all required files to the release folder (manifest.json, _locales, dist, src) `cp -R manifest.json _locales dist src release/`
3. `zip -vr release.zip release -x "*.DS_Store"`
4. Upload the zip file to the chrome store
