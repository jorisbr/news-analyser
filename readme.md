Development:
`npm run watch`

Release:
1. `npx webpack --config webpack.config.js --mode production --output-path release`
2. Move all required files to the release folder
3. `zip -vr folder.zip release -x "*.DS_Store"`
4. Upload the zip file to the chrome store