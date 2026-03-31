const button1 = document.querySelector("#js-new-quote");
const button2 = document.querySelector("#js-tweet");
const quoteText = document.querySelector("#js-quote-text");
const answerText = document.querySelector("#js-answer-text");

let currentQuestion = null;

const apiEndpoint = "https://trivia.cyberwisp.com/getrandomchristmasquestion";
function getQuote() {
    console.log("Button clicked");
    fetch(apiEndpoint)
        .then(response => response.json())
        .then(data => {
            console.log("Quote data:", data);
            displayQuote(data);
            answerText.textContent = "";
            currentQuestion = data;
        }
        )
        .catch(error => console.error("Error fetching quote:", error));
}

function displayQuote(quote) {
    const quoteText = quote.question;
    document.querySelector(".quote-text").textContent = quoteText;
}

function displayAnswer() {
    if (currentQuestion) {
        answerText.textContent = currentQuestion.answer;
    }
}

button1.addEventListener("click", getQuote);
button2.addEventListener("click", displayAnswer);
onload = getQuote;