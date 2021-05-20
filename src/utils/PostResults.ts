import { TestResults } from "../objects/TestResults";

export const postResults = (results: TestResults) => {
    fetch(`http://localhost:3000`, {
        method: "POST",
        headers: {
            'Accept': 'text/plain',
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(results)
    }).then((response) => {
        if (response.status >= 200 && response.status <= 299) {
            return response;
        } else {
            throw Error(response.statusText);
        }
    }).then((response) => {
        // do something with response
    }).catch((error) => {
        console.log(error);
    });
}
