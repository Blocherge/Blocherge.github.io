// Complete variable definitions and random functions

const customName = document.getElementById("custom-name");
const generateBtn = document.querySelector(".generate");
const story = document.querySelector(".story");

function randomValueFromArray(array) {
  const random = Math.floor(Math.random() * array.length);
  return array[random];
}

// Raw text strings

let characters = ["Professor Pancake", "Captain Bubblebeard", "Luna the Cat Wizard"];
let places = ["a secret underground library", "the moon base cafeteria", "a haunted roller rink"];
let events = [
  "suddenly turned invisible and started laughing",
  "exploded into a cloud of glitter",
  "forgot gravity existed and floated away"
];

function returnRandomStoryString() {
  let randomCharacter = randomValueFromArray(characters);
  let randomPlace = randomValueFromArray(places);
  let randomEvent = randomValueFromArray(events);

  let storyText = `On a strangely quiet afternoon, ${randomCharacter} wandered into ${randomPlace} looking for adventure.

At first, everything seemed perfectly normal. But then, without warning, ${randomCharacter} ${randomEvent}.

A confused bystander named Jamie watched the whole thing happen, blinking twice in disbelief.

"Yep," Jamie muttered, "that’s the third time I’ve seen something like that today."

And somehow, life just carried on as if nothing unusual had happened at all.`;

  return storyText;
}

// Event listener and partial generate function definition
generateBtn.addEventListener("click", generateStory);


function generateStory() {
  console.log("Button clicked");
  let newStory = returnRandomStoryString();
  
  if (customName.value !== "") {
    const name = customName.value;
    newStory = newStory.replace("Bob", name);
  }

  if (document.getElementById("uk").checked) {
    const weight = Math.round(300/14);
    const temperature = Math.round((94-32) * 5 / 9);
    newStory = newStory.replace("94 Fahrenheit", temperature + " Celsius");
    newStory = newStory.replace("300 pounds", weight + " stone");
  }

  console.log(newStory);
  // TODO: replace "" with the correct expression
  story.textContent = newStory;
  story.style.visibility = "visible";
}