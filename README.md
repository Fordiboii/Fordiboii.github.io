# Magno motion and form tests

This application is part of my master's thesis and implements a motion detection test and two variations of a form detection test for use in dyslexia research.
The application also aims to act as a dyslexia screening tool. The tests are based on the following master theses:
- Bjørnar Wold's [App for Early Detection of Dyslexia](https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2421182)
- Thea Hove Johansen and Maja Kirkerød's [Magno: An Application for Detection of Dyslexia - Dyslexia and Interface Design](https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2454100)
- Tore Angell Petersen's [An Application for Detection of Dyslexia](https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2557938)

## Usage
### Dependencies

To run the application you need Node.js and npm installed. Simply run `npm install` to install all project dependencies.

The project uses the following packages:
- [TypeScript](https://www.typescriptlang.org/)
- [Parcel](https://parceljs.org/) for web app bundling
- [PIXI.js](https://www.pixijs.com/) for rendering
- [MainLoop.js](https://github.com/IceCreamYou/MainLoop.js) as the apps main loop for handling timing issues
- [i18next](https://www.i18next.com/) to support multiple languages
- [gh-pages](https://github.com/tschaub/gh-pages) to easily publish files to a gh-pages branch

### Development build

With dependencies installed, run one of three commands to start the motion, form fixed or form random tests:
- `npm run dev:motion`
- `npm run dev:form-fixed`
- `npm run dev:form-random` 

The website is hosted at `localhost:8080`.

### Production build

To start the build procedure for any of the three tests, run:
- `npm run build:motion` - build files stored in `dist/motion`
- `npm run build:form-fixed` - build files stored in `dist/form_fixed`
- `npm run build:form-random` - build files stored in `dist/form_random`

To deploy to [github pages](pages.github.com), run:
- `npm run deploy:motion`
- `npm run deploy:form-fixed`
- `npm run deploy:form-random`

### Language support

The app comes with an English and a Norwegian translation. The default language is English. Translation files are found under `src/assets/locales/{lng}/translation{lng}.ts`, where `lng` is the languages abbreviation.

To add a translation, simply add a folder with your language's abbreviation as name and create a file to contain the translation object. For ease of use, extend the translation interface under `src/assets/locales/Translation.ts`.

To change the language, simply call `i18next.changeLanguage("{lng}")` with the language's abbreviation code.

## Credits

Forked from https://github.com/bySabi/pixijs-typescript-template.git.

## License

[MIT](./LICENSE)
