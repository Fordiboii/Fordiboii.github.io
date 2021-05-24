import Translation from "../Translation";

export const translationEN: Translation = {
    tutorialHeader: "TUTORIAL",
    pauseText: "Select a box",
    nextButton: "NEXT",
    backButton: "BACK",
    exitButton: "EXIT",
    patchLabelOne: "1",
    patchLabelTwo: "2",
    tutorialSitDownScreen: {
        tutorialText: "Take a seat with your stomach touching the edge of the table. " +
            "Place your device {{screenViewingDistance}} cm from the edge of the table."
    },
    tutorialTrialScreen: {
        tutorialText: "Try it out a few times! " +
            "Keep in mind that you will not receive feedback on whether or not you have chosen the correct box during the actual test. " +
            "To complete the tutorial, click NEXT.",
        startTutorialTrialButton: "START TUTORIAL TRIAL",
        trialCorrect: "Correct",
        trialIncorrect: "Incorrect",
        trialFinished: "Click NEXT to proceed"
    },
    testScreen: {
        startTestButton: "START TEST",
    },
    resultsScreen: {
        header: "TEST RESULTS",
        description: "Thank you for participating.",
        score: "YOUR SCORE: {{score}}",
        bar: {
            leftLabel: "1",
            rightLabel: "100"
        }
    },
    mobileScreen: {
        warning: "Woops, it looks like you are using a mobile device.\n\n" +
            "This site is only supported for desktop PCs, laptops and tablet devices."
    },
    motion: {
        header: "MOTION TEST",
        landingPageScreen: {
            tutorialText: "The Magno motion test measures your visual sensitivity to motion and is used in dyslexia research to further our understanding " +
                "of the disorder and its underlying causes. \n\n" +
                "You will first go through a tutorial as preparation before taking the test. " +
                "After completing it you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "The test takes approximately 8 minutes. " +
                "Click NEXT to continue.",
        },
        tutorialTaskScreen: {
            tutorialText: "In the test you are shown two boxes with moving dots." +
                " Your task is to select the box where some of the dots are moving left and right, here shown in box 2." +
                ` The dots are displayed for {{dotAnimationTime}} seconds before disappearing. ` +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times, increasing in difficulty when answered correctly and decreasing otherwise." +
                " Please take as much time as you need before selecting a box."
        }
    },
    formFixed: {
        header: "FORM FIXED TEST",
        landingPageScreen: {
            tutorialText: "The Magno form fixed test measures your object detection ability and is used in dyslexia research to further our understanding " +
                "of the disorder and its underlying causes. \n\n" +
                "You will first go through a tutorial as preparation before taking the test. " +
                "After completing it you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "The test takes approximately 8 minutes. " +
                "Click NEXT to continue."
        },
        tutorialTaskScreen: {
            tutorialText: "In the test you are shown two boxes with line segments rotated at different angles." +
                " Your task is to select the box where a number of line segments form circles, here shown in box 2." +
                ` The line segments are displayed for {{lineDisplayTime}} seconds before disappearing.` +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times, increasing in difficulty when answered correctly and decreasing otherwise." +
                " Please take as much time as you need before selecting a box."
        }
    },
    formRandom: {
        header: "FORM RANDOM TEST",
        landingPageScreen: {
            tutorialText: "The Magno form random test measures your object detection ability and is used in dyslexia research to further our understanding " +
                "of the disorder and its underlying causes. \n\n" +
                "You will first go through a tutorial as preparation before taking the test. " +
                "After completing it you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "The test takes approximately 8 minutes. " +
                "Click NEXT to continue."
        },
        tutorialTaskScreen: {
            tutorialText: "In the test you are shown two boxes with line segments rotated at different angles." +
                " Your task is to select the box where a number of line segments form circles, here shown in box 2." +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times, increasing in difficulty when answered correctly and decreasing otherwise." +
                " Please take as much time as you need before selecting a box."
        },
    }
}
