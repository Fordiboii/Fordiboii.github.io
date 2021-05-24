import Translation from "../Translation";

export const translationNO: Translation = {
    tutorialHeader: "OPPLÆRING",
    pauseText: "Velg en boks",
    nextButton: "NESTE",
    backButton: "TILBAKE",
    exitButton: "AVSLUTT",
    patchLabelOne: "1",
    patchLabelTwo: "2",
    tutorialSitDownScreen: {
        tutorialText: "Sitt ned med magen inntil kanten av bordet. " +
            "Plasser enheten din {{screenViewingDistance}} cm fra kanten av bordet."
    },
    tutorialTrialScreen: {
        tutorialText: "Prøv et par ganger selv! " +
            "Vær oppmerksom på at du ikke får tilbakemelding på om du har svart rett eller galt under selve testen. " +
            "Fullfør opplæringen og gå videre til testen ved å trykke NESTE.",
        startTutorialTrialButton: "START ØVELSE",
        trialCorrect: "Riktig",
        trialIncorrect: "Galt",
        trialFinished: "Trykk NESTE for å fortsette"
    },
    testScreen: {
        startTestButton: "START",
    },
    resultsScreen: {
        header: "TESTRESULTAT",
        description: "Takk for deltakelsen.",
        score: "DIN SCORE: {{score}}",
        bar: {
            leftLabel: "1",
            rightLabel: "100"
        }
    },
    mobileScreen: {
        warning: "Obs, det ser ut som du prøver å besøke nettsiden fra en mobil.\n\n" +
            "Vennligst benytt en PC eller tablet for å få tilgang til siden."
    },
    motion: {
        header: "BEVEGELSESTEST",
        landingPageScreen: {
            tutorialText: "Bevegelsestesten måler din evne til å oppfatte bevegelse og brukes til å forske på dysleksis underliggende årsaker.\n\n" +
                "Du vil først få opplæring i hvordan testen gjennomføres før du tar den. " +
                "Når du har gjennomført testen vil du motta en score mellom 1 og 100 hvor 1 er best mulige score. " +
                "Testen tar omtrent 8 minutter. " +
                "Trykk NESTE for å fortsette."
        },
        tutorialTaskScreen: {
            tutorialText: "Under testen blir du vist to bokser med bevegende prikker." +
                " Din oppgave er å velge boksen der noen av prikkene beveger seg til venstre og høyre, her vist i boks 2." +
                ` Prikkene blir vist i {{dotAnimationTime}} sekunder før de forsvinner. ` +
                " Du velger en boks ved å trykke på den eller ved å benytte venstre og høyre piltast." +
                " Denne oppgaven gjentas flere ganger med økende vanskelighetsgrad når du velger riktig, og minkende når du velger feil." +
                " Ta den tiden du trenger før du velger boks."
        }
    },
    formFixed: {
        header: "FORMTEST - FIKSERT",
        landingPageScreen: {
            tutorialText: "Formtesten måler din evne til å oppdage objekter og brukes til å forske på dysleksis underliggende årsaker.\n\n" +
                "Du vil først få opplæring i hvordan testen gjennomføres før du tar den. " +
                "Når du har gjennomført testen vil du motta en score mellom 1 og 100 hvor 1 er best mulige score. " +
                "Testen tar omtrent 8 minutter. " +
                "Trykk NESTE for å fortsette.",
        },
        tutorialTaskScreen: {
            tutorialText: "Under testen blir du vist to bokser med linjesegmenter rotert i ulike retninger." +
                " Din oppgave er å velge boksen der noen av linjesegmentene danner sirkler, her vist i boks 2." +
                ` Linjesegmentene blir vist i {{lineDisplayTime}} sekunder før de forsvinner. ` +
                " Du velger en boks ved å trykke på den eller ved å benytte venstre og høyre piltast." +
                " Denne oppgaven gjentas flere ganger med økende vanskelighetsgrad når du velger riktig, og minkende når du velger feil." +
                " Ta den tiden du trenger før du velger boks."
        }
    },
    formRandom: {
        header: "FORMTEST - VILKÅRLIG",
        landingPageScreen: {
            tutorialText: "Formtesten måler din evne til å oppdage objekter og brukes til å forske på dysleksis underliggende årsaker.\n\n" +
                "Du vil først få opplæring i hvordan testen gjennomføres før du tar den. " +
                "Når du har gjennomført testen vil du motta en score mellom 1 og 100 hvor 1 er best mulige score. " +
                "Testen tar omtrent 8 minutter. " +
                "Trykk NESTE for å fortsette.",
        },
        tutorialTaskScreen: {
            tutorialText: "Under testen blir du vist to bokser med linjesegmenter rotert i ulike retninger." +
                " Din oppgave er å velge boksen der noen av linjesegmentene danner sirkler, her vist i boks 2." +
                " Du velger en boks ved å trykke på den eller ved å benytte venstre og høyre piltast." +
                " Denne oppgaven gjentas flere ganger med økende vanskelighetsgrad når du velger riktig, og minkende når du velger feil." +
                " Ta den tiden du trenger før du velger boks."
        }
    }
}
