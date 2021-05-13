import { TutorialSitDownScreen } from "../screens/tutorialScreens/TutorialSitDownScreen";
import { TutorialTaskScreen } from "../screens/tutorialScreens/TutorialTaskScreen";
import { TutorialTrialScreen } from "../screens/tutorialScreens/TutorialTrialScreen";
import { TestScreen } from "../screens/TestScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { LandingPageScreen } from "../screens/LandingPageScreen";
import { LoadingScreen } from "../screens/LoadingScreen";
import { MobileScreen } from "../screens/MobileScreen";

export interface Screens {
    [key: string]: LandingPageScreen | TutorialSitDownScreen | TutorialTaskScreen | TutorialTrialScreen | TestScreen | ResultsScreen | LoadingScreen | MobileScreen
}