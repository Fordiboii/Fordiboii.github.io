import * as PIXI from 'pixi.js';
import MainLoop from 'mainloop.js';
import { BACKGROUND_COLOR, SIMULATION_TIMESTEP } from './utils/Constants';
import { MobileScreen } from './screens/MobileScreen';
import { TestScreen } from './screens/TestScreen';
import { LandingPageScreen } from './screens/LandingPageScreen';
import { TutorialSitDownScreen } from './screens/tutorialScreens/TutorialSitDownScreen';
import { TutorialTaskScreen } from './screens/tutorialScreens/TutorialTaskScreen';
import { TutorialTrialScreen } from './screens/tutorialScreens/TutorialTrialScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { Screens } from "./interfaces/screens";
import { ResultsScreen } from './screens/ResultsScreen';
import { Settings } from './utils/Settings';
import { TestResults } from './objects/TestResults';
import { TestType } from './utils/Enums';
import i18next from 'i18next';

export class GameApp {
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public screens: Screens = {};
    public currentScreen: TestScreen | LandingPageScreen | TutorialSitDownScreen | TutorialTaskScreen | TutorialTrialScreen | LoadingScreen | ResultsScreen | MobileScreen;
    private backgroundSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    private testResults: TestResults;
    public testType: TestType;

    constructor(width: number, height: number, testType: TestType) {
        this.testType = testType;

        // create root container and renderer
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer({
            width: width,
            height: height,
            resolution: window.devicePixelRatio, // for retina display devices
            autoDensity: true, // for retina display devices
        });

        // add background color
        this.stage.addChild(this.backgroundSprite);

        if (process.env.NODE_ENV != "production") {
            // For using pixijs inspection dev tool.
            (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ && (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
        }

        // add renderer view to document body
        window.document.body.appendChild(this.renderer.view)

        // set timestep (in ms) the app should simulate between each frame.
        MainLoop.setSimulationTimestep(SIMULATION_TIMESTEP);

        // warn if the browser doesn't support the Page Visibility API and revert to onblur and onfocus events.
        if (document.hidden === undefined) {
            console.log("This website requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.")
            window.onblur = () => MainLoop.stop();
            window.onfocus = () => MainLoop.start();
        } else {
            // stop running if the tab is hidden and start if made visible.
            window.addEventListener("visibilitychange", () => {
                if (window.document.visibilityState == "hidden") {
                    MainLoop.stop();
                } else if (window.document.visibilityState == "visible") {
                    MainLoop.start();
                }
            })
        }

        // add resize event listener
        window.addEventListener('resize', this.resize);

        // add language change event handler
        i18next.on("languageChanged", (_lng): void => {
            Object.values(this.screens).forEach(screen => screen.languageChangeHandler());
        });

        // load settings
        Settings.load();

        // set draw and update methods and start main loop
        MainLoop.setDraw(this.render);
        MainLoop.setUpdate((delta: number) => this.gameLoop(delta));
        MainLoop.start();

        // check if user is on a mobile device
        if (window.matchMedia("only screen and (max-width: 760px)").matches) {
            const mobileScreen: MobileScreen = new MobileScreen();
            this.screens.mobileScreen = mobileScreen;
            this.stage.addChild(mobileScreen);
            this.currentScreen = mobileScreen;
            return;
        }

        // show loading screen
        this.showLoadingScreen();

        // load assets
        const loader = PIXI.Loader.shared;
        loader.onError.add((err, _loader, resource) => { console.log(err, resource) });
        loader.onComplete.once(() => {
            // initialize game
            this.setup();
        });
        loader
            .add('dot', './assets/sprites/dot.png')
            .add('line', './assets/sprites/line.png')
            .add('backArrow', './assets/sprites/backArrow.png')
            .add('circleHollow', './assets/sprites/circle_hollow.png')
            .add('circleFilled', './assets/sprites/circle_filled.png')
            .add('resultsBarMarker', './assets/sprites/resultsBarMarker.png')
            .add('checkmark', './assets/sprites/checkmark.png')
            .add('cross', './assets/sprites/cross.png')
            .add('sitDownImage', './assets/images/TutorialSitDown-01.png')
            .add('magnoLogo', './assets/images/magnologo.png')
            .add('helvetica', './assets/fonts/helvetica-bitmap.fnt')
            .load()
    }

    private showLoadingScreen = (): void => {
        const loadingScreen: LoadingScreen = new LoadingScreen();
        this.screens.loadingScreen = loadingScreen;
        this.stage.addChild(loadingScreen);
        this.currentScreen = loadingScreen;
    }

    private setup = (): void => {
        // create screens
        const landingPageScreen: LandingPageScreen = new LandingPageScreen(this, this.testType);
        const tutorialSitDownScreen: TutorialSitDownScreen = new TutorialSitDownScreen(this, this.testType);
        const tutorialTaskScreen: TutorialTaskScreen = new TutorialTaskScreen(this, this.testType);
        const tutorialTrialScreen: TutorialTrialScreen = new TutorialTrialScreen(this, this.testType);
        const testScreen: TestScreen = new TestScreen(this, this.testType);

        this.screens.landingPageScreen = landingPageScreen;
        this.screens.tutorialSitDownScreen = tutorialSitDownScreen;
        this.screens.tutorialTaskScreen = tutorialTaskScreen;
        this.screens.tutorialTrialScreen = tutorialTrialScreen;
        this.screens.testScreen = testScreen;

        this.stage.addChild(landingPageScreen, tutorialSitDownScreen, tutorialTaskScreen, tutorialTrialScreen, testScreen);

        // set background size and color
        this.backgroundSprite.width = Settings.WINDOW_WIDTH_PX;
        this.backgroundSprite.height = Settings.WINDOW_HEIGHT_PX;
        this.backgroundSprite.tint = BACKGROUND_COLOR;

        // hide screens and change to first tutorial screen
        this.screens.tutorialSitDownScreen.visible = false;
        this.screens.tutorialTaskScreen.visible = false;
        this.screens.tutorialTrialScreen.visible = false;
        this.screens.testScreen.visible = false;
        this.changeScreen("landingPageScreen");
    }

    private gameLoop = (delta: number): void => {
        // update model
        this.currentScreen.update(delta);

        // log FPS
        // let fps = Math.round(MainLoop.getFPS());
        // console.log(fps);
    }

    /**
     * Sets the current screen. 
     * @param key string referring to a key in the Screens interface.
     */
    public changeScreen = (key: "landingPageScreen" | "tutorialSitDownScreen" | "tutorialTaskScreen" | "tutorialTrialScreen" | "testScreen" | "resultsScreen"): void => {
        // disable current screen and remove event listeners
        this.currentScreen.visible = false;
        this.currentScreen.removeEventListeners();
        // create new instances of TestScreen and TutorialTrialScreen if navigated back to
        if (this.currentScreen === this.screens.testScreen) {
            this.stage.removeChild(this.screens.testScreen);
            this.screens.testScreen = new TestScreen(this, this.testType);
            this.screens.testScreen.visible = false;
            this.stage.addChild(this.screens.testScreen);
        } else if (this.currentScreen === this.screens.tutorialTrialScreen) {
            this.stage.removeChild(this.screens.tutorialTrialScreen);
            this.screens.tutorialTrialScreen = new TutorialTrialScreen(this, this.testType);
            this.screens.tutorialTrialScreen.visible = false;
            this.stage.addChild(this.screens.tutorialTrialScreen);
        }
        if (key == "resultsScreen") {
            // create result screen and set it to current screen.
            this.screens.resultsScreen = new ResultsScreen(this);
            this.stage.addChild(this.screens.resultsScreen);
            this.currentScreen = this.screens.resultsScreen;
        } else if (key == "testScreen") {
            // hide background
            this.backgroundSprite.visible = false;
            // change to new screen
            this.currentScreen = this.screens[key];
        } else {
            // show background
            this.backgroundSprite.visible = true;
            // change to new screen
            this.currentScreen = this.screens[key];
        }
        this.currentScreen.addEventListeners();
        this.currentScreen.visible = true;
    }

    private render = (): void => {
        this.renderer.render(this.stage);
    }

    private resize = (): void => {
        // load settings with new width and height
        Settings.load();

        // store new width and height
        const newWidth: number = window.innerWidth;
        const newHeight: number = window.innerHeight;

        // resize renderer
        this.renderer.resize(newWidth, newHeight);
        // resize background
        this.backgroundSprite.width = newWidth;
        this.backgroundSprite.height = newHeight;
        // resize all screens.   
        Object.values(this.screens).forEach(screen => screen.resize(newWidth, newHeight));
    };

    getTestResults = (): TestResults => {
        return this.testResults;
    }

    setTestResults = (testResults: TestResults): void => {
        this.testResults = testResults;
    }
}
