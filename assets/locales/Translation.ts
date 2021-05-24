export default interface Translation {
    tutorialHeader: string,
    pauseText: string,
    nextButton: string,
    backButton: string,
    exitButton: string,
    patchLabelOne: string,
    patchLabelTwo: string,
    tutorialSitDownScreen: {
        tutorialText: string
    },
    tutorialTrialScreen: {
        tutorialText: string,
        startTutorialTrialButton: string,
        trialCorrect: string,
        trialIncorrect: string,
        trialFinished: string
    },
    testScreen: {
        startTestButton: string,
    },
    resultsScreen: {
        header: string,
        description: string,
        score: string,
        bar: {
            leftLabel: string,
            rightLabel: string,
        }
    },
    mobileScreen: {
        warning: string
    },
    motion: {
        header: string,
        landingPageScreen: {
            tutorialText: string
        },
        tutorialTaskScreen: {
            tutorialText: string
        }
    },
    formFixed: {
        header: string,
        landingPageScreen: {
            tutorialText: string
        },
        tutorialTaskScreen: {
            tutorialText: string
        }
    },
    formRandom: {
        header: string,
        landingPageScreen: {
            tutorialText: string
        },
        tutorialTaskScreen: {
            tutorialText: string
        }
    }
}