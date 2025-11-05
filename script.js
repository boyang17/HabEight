/**
 * HabEight
 */

// DOM Elements
const dateDisplaying = document.getElementById("date-displaying");
const habitList = document.getElementById("habit-list");
const addHabitBtn = document.getElementById("add-habit-button");
const habitToAdd = document.getElementById("habit-to-add");
const prevDateBtn = document.getElementById("prev-date-btn");
const nextDateBtn = document.getElementById("next-date-btn");
const graphBtns = document.getElementById("graph-btns");
const squares = document.querySelector(".squares");
const todayBtn = document.getElementById("today-btn");
const dashboard = document.getElementById("dashboard");
const displayStreak = document.getElementById("display-streak");
const daysTracked = document.getElementById("days-tracked");
const toggleThemeBtn = document.getElementById("toggle-theme-btn");
const inputHabit = document.getElementById("input-habit");
const limitWarning = document.getElementById("limit-warning");
const snackbar = document.getElementById("snackbar");
const dashboardNote = document.getElementById("dashboard-note");
const infoBtn = document.getElementById("info-btn");
const quote = document.getElementById("quote");
const dateInfoBtn = document.getElementById("date-info-btn");
const habitListNote = document.getElementById("habit-list-note");

// State and Data
/**
 * Example data structure for habit tracking:
 * habits = [
    {
      habit: "run",
      streak: 2,
      record: {
        "2025-9-22": true,
        "2025-9-23": true,
      },
    },
    ...
  ]
 */
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let graphIndex = parseInt(localStorage.getItem("graphIndex"), 10) || 1;
let currentDate = localStorage.getItem("currentDate")
  ? new Date(JSON.parse(localStorage.getItem("currentDate")))
  : new Date();
let theme = localStorage.getItem("theme");

let today = new Date();
const habitColors = {
  1: "#f08080",
  2: "#7bc96f",
  3: "#87cefa",
  4: "#9370db",
  5: "#ff7f50",
  6: "#0044cc",
  7: "#ffd700",
  8: "#ff69b4",
};

const milestoneQuotes = {
  0: "The best time to plant a tree is 20 years ago. The second-best time is now.",
  1: "One who climbs the ladder must begin at the bottom",
  3: "Small steps, every day",
  7: "It gets easier. Every day it gets a little easier. \
  But you gotta do it every day — that's the hard part.",
  14: "Progress, not perfection.",
  21: "Success is a series of small wins",
  30: "Excellence is not an act, but a habit",
  50: "What was once effort is now your nature",
  80: "Beyond mastery lies meaning",
  120: "Per aspera ad astra",
};

// Initialization
setTheme();
init();

/**
 * Init and load everything at the start
 */
function init() {
  dateDisplaying.setAttribute("max", formatDate(today));
  displayDate(currentDate);
  displayHabits(currentDate);
  sortDates();
  disableNextBtn();
  disableAddHabitBtn();
  showLimitWarning("none", "none");
  spawnHabitGraphBtn();
  disableGraphBtn(graphIndex);
  showCurrentStreak(graphIndex);
  showHabitGraph(graphIndex);
  highlightHabit(graphIndex);
  dashboardNote.innerHTML = "";
  initDaysTracked();
  showDashboardNotes();
}

// Jumps to today's date
todayBtn.addEventListener("click", () => {
  currentDate = today;
  localStorage.setItem("currentDate", JSON.stringify(currentDate));
  init();
});

/**
 * Displays the date on top of the habits
 * @param {Date} date
 */
function displayDate(date) {
  dateDisplaying.value = formatDate(date);
}

/**
 * Formats the input date into a display string
 * @param {Date} date
 * @returns {string} formatted date
 */
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

/**
 * Create display elements and displays the habits in a list.
 */
function displayHabits(date) {
  habitList.innerHTML = "";
  habits.forEach((h) => {
    let habit;
    const dateKey = formatDate(date);
    const isChecked = h["record"][dateKey] || false;

    habit = createHabitCheckbox(h["habit"], h["habit"], isChecked);
    habitList.appendChild(habit);
  });
}

/**
 * Creates a list item containing a checkbox input and a label for a habit
 * @param {string} id checkbox's id
 * @param {string} name label text for the habit
 * @param {boolean} isChecked whether the habit is checked or not
 * @returns {HTMLElement} the <li> element containing the checkbox and label
 */
function createHabitCheckbox(id, name, isChecked = false) {
  const habitCheckbox = document.createElement("input");
  habitCheckbox.type = "checkbox";
  habitCheckbox.id = id;
  habitCheckbox.name = name;
  habitCheckbox.checked = isChecked;
  habitCheckbox.style = `width: 15px; height: 15px;   ; display: inline-block; \
     vertical-align: middle; border-radius: 1px; \ margin-right: 0px;
     accent-color: ${habitColors[habits.findIndex((h) => h.habit === id) + 1]}`;
  habitCheckbox.classList.add("hover-effect");

  habitCheckbox.addEventListener("change", () => {
    graphIndex = habits.findIndex((h) => h.habit === habitCheckbox.id) + 1;
    fillHabits();
    sortDates();
    updateHabits(habitCheckbox, currentDate);
    calculateCurrentStreak();
    init();
  });

  const habitLabel = document.createElement("label");
  habitLabel.id = "habit-label";
  habitLabel.htmlFor = id;
  habitLabel.textContent = name;
  habitLabel.style = "margin: 5px;";

  const deleteHabitBtn = document.createElement("button");
  deleteHabitBtn.id = "delete-habit-btn";
  deleteHabitBtn.title = "delete";
  deleteHabitBtn.innerHTML = `<i class="fa fa-trash-o" aria-hidden="true"></i>`;

  const habitItem = document.createElement("li");

  deleteHabitBtn.addEventListener("click", () => {
    deleteHabit(name);
    disableAddHabitBtn();
    spawnHabitGraphBtn();
    showLimitWarning("", "block");
    initDaysTracked();

    if (habits.length > 0) {
      disableGraphBtn(graphIndex);
      if (graphIndex > habits.length) {
        graphIndex -= 1;
        localStorage.setItem("graphIndex", graphIndex);
        showHabitGraph(graphIndex);
        disableGraphBtn(graphIndex);
        showCurrentStreak(graphIndex);
        highlightHabit(graphIndex);
      }
      highlightHabit(graphIndex);
    } else {
      showCurrentStreak(graphIndex);
      highlightHabit(graphIndex);
      squares.innerHTML = "";
    }
  });

  habitItem.id = "habit-item";
  habitItem.style.display = "flex";
  habitItem.style.alignItems = "center";
  habitItem.style.width = "fit-content";
  habitItem.appendChild(habitCheckbox);
  habitItem.appendChild(habitLabel);
  habitItem.appendChild(deleteHabitBtn);

  return habitItem;
}

/**
 * Searchs the habit in the habits list to delete
 * @param {string} habit the habit to delete
 */
function deleteHabit(habit) {
  habits.forEach((h, i) => {
    if (h["habit"] === habit) {
      habits.splice(i, 1);
    }
  });

  localStorage.setItem("habits", JSON.stringify(habits));
  displayHabits(currentDate);
}

/**
 * Updates the status of the date's habits completeness.
 * @param {HTMLElement} habitCheckbox checkbox for the status of the habit
 * @param {Date} date the date of which it is updating
 */
function updateHabits(habitCheckbox, date) {
  if (habitCheckbox.checked === true) {
    habits.find((h) => h.habit === habitCheckbox.name)["record"][
      formatDate(date)
    ] = true;
    sortDates();
    localStorage.setItem("habits", JSON.stringify(habits));
  } else if (habitCheckbox.checked === false) {
    habits.find((h) => h.habit === habitCheckbox.name)["record"][
      formatDate(date)
    ] = false;
    sortDates();
    localStorage.setItem("habits", JSON.stringify(habits));
  }
}

/**
 * It records the habits in between the select date and today
 * and in between select date and the earliest recorded date
 * as not finished
 */
function fillHabits() {
  let dateToAdd = new Date(currentDate);
  let daysToToday = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));

  if (habits.length === 0) {
    return;
  }

  sortDates();

  for (let i = 0; i < daysToToday; i++) {
    dateToAdd.setDate(dateToAdd.getDate() + 1);
    let habit = habits[graphIndex - 1];

    if (!(formatDate(dateToAdd) in habit.record)) {
      habit["record"][formatDate(dateToAdd)] = false;
    }
  }

  dateToAdd = new Date(
    Object.keys(habits[graphIndex - 1]["record"])[
      Object.keys(habits[graphIndex - 1]["record"]).length - 1
    ]
  );
  let daysToEarliest = Math.floor(
    (currentDate - dateToAdd) / (1000 * 60 * 60 * 24)
  );

  for (let i = 0; i < daysToEarliest; i++) {
    dateToAdd.setDate(dateToAdd.getDate() + 1);
    let habit = habits[graphIndex - 1];

    if (!(formatDate(dateToAdd) in habit.record)) {
      habit["record"][formatDate(dateToAdd)] = false;
    }
  }

  sortDates();
  localStorage.setItem("habits", JSON.stringify(habits));
}

// Add a click listener to add a habit to "currentDate" and all the habit in between the "currentDate" and "today"
// and redisplay the habits with the newly added
addHabitBtn.addEventListener("click", () => {
  addHabit(currentDate);
  fillHabits();
  sortDates();
  displayHabits(currentDate);
  disableAddHabitBtn();
  showLimitWarning("", "block");
  spawnHabitGraphBtn();
  disableGraphBtn(graphIndex);
  showHabitGraph(graphIndex);
  showCurrentStreak(graphIndex);
  highlightHabit(graphIndex);
});

/**
 * Adds a new habit to the list of habbits. Alerts if user tries to add repeated habit
 * @param {Date} date the date habit is started to get tracked
 */
function addHabit(date) {
  let formattedDate = formatDate(date);
  let inputHabit = habitToAdd.value.trim();

  if (!inputHabit) {
    showSnackbar("Please enter a habit!");
    return;
  }

  let alreadyExists = habits.some((h) => h.habit === inputHabit);

  if (alreadyExists) {
    showSnackbar("Cannot add repeated habit!");
    return;
  }

  let habit = {
    habit: inputHabit,
    streak: 0,
    record: { [formattedDate]: false },
  };

  habits.push(habit);
  localStorage.setItem("habits", JSON.stringify(habits));
  habitToAdd.value = "";
}

// Adds a click listner so the user can go to the previous date
prevDateBtn.addEventListener("click", () => {
  let newDate = differentDate("prev");

  currentDate = newDate;
  displayDate(newDate);
  displayHabits(newDate);
  sortDates();
  disableNextBtn();
  showHabitGraph(graphIndex);
  highlightHabit(graphIndex);

  localStorage.setItem("currentDate", JSON.stringify(newDate));
});

// Adds a click listner so the user can go to the next date
nextDateBtn.addEventListener("click", () => {
  let newDate = differentDate("next");

  currentDate = newDate;
  displayDate(newDate);
  displayHabits(newDate);
  sortDates();
  disableNextBtn();
  showHabitGraph(graphIndex);
  highlightHabit(graphIndex);

  localStorage.setItem("currentDate", JSON.stringify(newDate));
});

// The user can go to any date in the past
dateDisplaying.addEventListener("change", () => {
  let newDate = parseDateInput(dateDisplaying.value);

  if (newDate > today) {
    newDate = today;
    dateDisplaying.value = formatDate(today);
    showSnackbar("No time traveling into the future bud");
    return;
  }

  currentDate = newDate;
  displayHabits(newDate);
  // fillHabits();
  sortDates();
  disableNextBtn();
  showHabitGraph(graphIndex);
  highlightHabit(graphIndex);

  localStorage.setItem("currentDate", JSON.stringify(newDate));
});

/**
 * Helper function that correctly changes the date string to Date
 * @param {String} date input date string
 * @returns {Date} the date in Date format
 */
function parseDateInput(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Goes to the day before or after user's display date
 * @param {string} when goes to the previous or next date
 * @returns the new Date()
 */
function differentDate(when) {
  let currentDateObject = new Date(currentDate);
  if (when === "prev") {
    currentDateObject.setDate(currentDateObject.getDate() - 1);
  } else if (when === "next") {
    currentDateObject.setDate(currentDateObject.getDate() + 1);
  }

  return currentDateObject;
}

/**
 * Disables the next button so the user cannot time travel into the future
 */
function disableNextBtn() {
  if (formatDate(currentDate) === formatDate(today)) {
    dateDisplaying.value = formatDate(today);
    nextDateBtn.disabled = true;
    nextDateBtn.style.color = "#A6A7A8";
  } else {
    nextDateBtn.style.color = "";
    nextDateBtn.disabled = false;
  }
}

/**
 * Disables the add habit btn if there are 8 habits.
 */
function disableAddHabitBtn() {
  if (habits.length >= 8) {
    addHabitBtn.disabled = true;
  } else {
    addHabitBtn.disabled = false;
  }
}

/**
 * Sorts the dates of the tracking habits in chronological order
 * newest date is the first entry
 */
function sortDates() {
  habits.forEach((h) => {
    const dates = Object.entries(h.record);
    dates.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    h.record = Object.fromEntries(dates);
  });
  calculateCurrentStreak();
  localStorage.setItem("habits", JSON.stringify(habits));
}

/**
 * Calculates the current streak for each habits
 */
function calculateCurrentStreak() {
  habits.forEach((h) => {
    h.streak = 0;
    let i = 0;
    let dateState = h.record[Object.keys(h.record)[i]];
    while (dateState === true) {
      h.streak++;
      i++;
      dateState = h.record[Object.keys(h.record)[i]];
    }
  });

  localStorage.setItem("habits", JSON.stringify(habits));
}

/**
 * Displays the current streak count
 */
function showCurrentStreak(index) {
  if (habits.length === 0) {
    displayStreak.innerHTML = `<div id="streak" class="tooltip">
  <span class="tooltiptext">Current Streak: consecutive days you've completed all your habits.</span>
  <img id= "streak-fire" src=""> 
  <span id="streak-number" class="milestone">N/A</span>
  </div>`;
    quote.innerText = "";
    return;
  }

  const currentStreak = habits[index - 1]["streak"];
  displayStreak.innerHTML = `<div id="streak" class="tooltip">
  <span class="tooltiptext">Current Streak: consecutive days you've completed all your habits.</span>
  <img id= "streak-fire" src=""> 
  <span id="streak-number" class="milestone">${currentStreak}</span>
  </div>`;

  const streakNumber = document.getElementById("streak-number");
  reachMilestone(currentStreak);
}

/**
 * Create buttons for each habit to show the corresponding progress graph
 */
function spawnHabitGraphBtn() {
  graphBtns.innerHTML = "";

  for (let i = 0; i < habits.length; i++) {
    const graphBtn = document.createElement("button");
    graphBtn.id = "graph-btn";

    const color = document.createElement("span");
    color.id = "color-circle";
    color.style.backgroundColor = `${habitColors[i + 1]}`;

    graphBtn.appendChild(color);

    graphBtn.addEventListener("click", () => {
      const allBtns = graphBtns.querySelectorAll("button");
      allBtns.forEach((btn) => {
        btn.disabled = false;
      });

      graphIndex = i + 1;
      localStorage.setItem("graphIndex", graphIndex);

      showHabitGraph(graphIndex);
      graphBtn.disabled = true;

      showCurrentStreak(graphIndex);
      dashboardNote.innerHTML = "";
      highlightHabit(graphIndex);
      showDashboardNotes();
    });

    graphBtns.appendChild(graphBtn);
  }
}

/**
 * Disables whichever habit's button when its graph is on display
 * @param {integer} index the index of the button to disable
 */
function disableGraphBtn(index) {
  const allBtns = graphBtns.querySelectorAll("button");

  if (allBtns.length === 0 || index < 0 || index > allBtns.length) {
    return;
  }

  allBtns[index - 1].disabled = true;
}

/**
 * Shows the progress graph of each habit github activity style
 * @param {integer} habitIndex which habit to shown indicated by the index
 */
function showHabitGraph(habitIndex) {
  squares.innerHTML = "";

  if (habits.length === 0) {
    return;
  }

  const dates = Object.keys(habits[habitIndex - 1].record);
  let recordLength = Object.keys(habits[habitIndex - 1].record).length;
  // Max squares shown: 60
  let startIndex = Math.min(recordLength - 1, 119);

  daysTracked.innerText = `Total days tracked: ${recordLength} days | Showing: ${
    startIndex + 1
  } days`;
  let level = 0;

  for (let i = startIndex; i >= 0; i--) {
    if (habits[habitIndex - 1].record[dates[i]] === true) {
      level = habitIndex;
    } else {
      level = 0;
    }
    squares.insertAdjacentHTML(
      "beforeend",
      `<li id="date-square-${i}" data-level="${level}" title="${dates[i]}"></li>`
    );

    const dateSqaure = document.getElementById(`date-square-${i}`);
    dateSqaure.style =
      "font-size: 16px; cursor: pointer;\
      transition: transform 0.1s ease-in-out;";
    dateSqaure.classList.add("hover-effect");

    dateSqaure.addEventListener("click", () => {
      const parts = dates[i].split("-");
      currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
      localStorage.setItem("currentDate", JSON.stringify(currentDate));
      init();
    });
  }
}

/**
 * Sets the theme of the webpage
 */
function setTheme() {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else if (theme === "light") {
    document.body.classList.remove("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    // Checks for system dark mode.
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

// Toggles the webpage between dark and light mode
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  highlightHabit(graphIndex);

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

/**
 * Shows the limit warning if the habits limit is reached
 * @param {string} animationState controls whether to show the animation or not
 * @param {string} limitWarningState controls whether limit warning sign is shown or not
 */
function showLimitWarning(animationState, limitWarningState) {
  if (habits.length < 8) {
    inputHabit.style.animation = animationState;
    inputHabit.style.animation = "fadeIn 0.75s ease-in-out;";
    limitWarning.style.display = "none";
    inputHabit.style.display = "block";
  } else {
    limitWarning.style.animation = animationState;
    limitWarning.style.animation = "fadeIn 0.75s ease-in-out;";
    inputHabit.style.display = "none";
    limitWarning.style.display = limitWarningState;
  }
}

/**
 * Shows a alert snackbar at the bottom right of the screen
 * @param {string} message alert message
 */
function showSnackbar(message) {
  snackbar.innerText = message;
  snackbar.className = "show";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 1750);
}

// Gave ability to add habit when enter is pressed inside the habit input
habitToAdd.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addHabitBtn.click();
  }
});

/**
 * Creates the information for the habit graph
 */
function showDashboardNotes() {
  const noteOne = document.createElement("div");
  noteOne.classList.add("note-style");
  const noteOneText = document.createElement("p");
  noteOneText.innerText = "Each square represents one day tracked";
  noteOne.appendChild(noteOneText);

  const noteTwo = document.createElement("div");
  noteTwo.classList.add("note-style");
  noteTwo.innerHTML = "";

  const color = document.createElement("span");
  color.id = "gray-square";
  color.style.backgroundColor = `${habitColors[graphIndex]}`;

  const noteTwoText = document.createElement("p");
  noteTwoText.innerText = "show tracked days";
  noteTwo.appendChild(color);
  noteTwo.appendChild(noteTwoText);

  const noteThree = document.createElement("div");
  noteThree.classList.add("note-style");
  const noteThreeText = document.createElement("p");
  noteThreeText.innerText = "Click any square to jump to that date";
  noteThree.appendChild(noteThreeText);

  const noteFour = document.createElement("div");
  noteFour.classList.add("note-style");
  noteFour.innerHTML = "";

  const gray = document.createElement("span");
  gray.id = "gray-square";

  const noteFourText = document.createElement("p");
  noteFourText.innerText = "show untracked days";
  noteFour.appendChild(gray);
  noteFour.appendChild(noteFourText);

  dashboardNote.appendChild(noteOne);
  dashboardNote.appendChild(noteTwo);
  dashboardNote.appendChild(noteThree);
  dashboardNote.appendChild(noteFour);
}

// Clicking on the info button will show/hide the habit graph info
infoBtn.addEventListener("click", () => {
  if (dashboardNote.style.display === "none") {
    dashboardNote.style.animation = "slideDownShow 0.5s ease-in-out forwards";
    dashboardNote.style.display = "grid";
  } else {
    dashboardNote.style.animation = "slideUpGone 0.5s ease-in-out forwards";
    setTimeout(() => {
      dashboardNote.style.display = "none";
    }, 500);
  }
});

dateInfoBtn.addEventListener("click", () => {
  if (habitListNote.style.display === "none") {
    habitListNote.style.animation = "fadeIn 0.5s ease-in-out forwards";
    habitListNote.style.display = "block";
  } else {
    habitListNote.style.animation = "fadeOut 0.5s ease-in-out forwards";
    setTimeout(() => {
      habitListNote.style.display = "none";
    }, 500);
  }
});

/**
 * Initialize the days tracked and days showing to N/A
 */
function initDaysTracked() {
  if (habits.length === 0) {
    daysTracked.innerText = `Total days tracked: 0 days | Showing: 0 days`;
  }
}

/**
 * highlights the habit label corresponding to the selected habit graph
 * @param {integer} index the index of the habit to highlight
 * @returns nothing
 */
function highlightHabit(index) {
  const habitItems = habitList.getElementsByTagName("li");

  for (let i = 0; i < habitItems.length; i++) {
    habitItems[i].getElementsByTagName("label")[0].style.backgroundColor = "";
  }

  if (habits.length === 0) {
    return;
  }

  if (document.body.classList.contains("dark")) {
    habitItems[index - 1].getElementsByTagName(
      "label"
    )[0].style.backgroundColor = "rgba(135, 206, 235, 0.8)";
  } else {
    habitItems[index - 1].getElementsByTagName(
      "label"
    )[0].style.backgroundColor = "rgba(255, 255, 150, 0.8)";
  }
}

/**
 * If it reaches a certain sreak number, a motivational quote will appear.
 * Else, a random motivational quote from https://forismatic.com/en/ API will appear.
 * @param {integer} num whichever streak number it is on right now
 */
async function reachMilestone(num) {
  let str = num.toString();
  quote.innerText = "";

  if (milestoneQuotes[str]) {
    quote.innerText = milestoneQuotes[str];
    return;
  }

  // This approach often leads to unwanted errors with the JSON parsing.
  // try {
  //   const url =
  //     "https://api.allorigins.win/get?url=" +
  //     encodeURIComponent(
  //       "http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json"
  //     ) +
  //     `&_=${Date.now()}`;

  //   const response = await fetch(url);
  //   if (!response.ok) throw new Error("quote not found");

  //   const data = await response.json();
  //   const parsed = JSON.parse(data.contents);

  //   const quoteText = parsed.quoteText || "";

  //   quote.innerText = quoteText;
  // } catch (error) {
  //   console.error("Error fetching quote:", error);
  //   quote.innerText = "";
  // }

  window.forismaticCallback = function (data) {
    if (data && data.quoteText) {
      quote.innerText = data.quoteText;
    } else {
      quote.innerText = "";
    }
  };

  const script = document.createElement("script");
  script.src = `https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=forismaticCallback&_=${Date.now()}`;
  document.body.appendChild(script);

  script.onload = () => {
    document.body.removeChild(script);
  };
}

// Give the webpage keyboard shortcuts
document.addEventListener("keydown", function (event) {
  const habitItems = habitList.getElementsByTagName("li");
  const active = document.activeElement;

  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.isContentEditable
  )
    return;

  switch (event.key) {
    case "ArrowUp":
      if (graphIndex > 1) {
        graphIndex -= 1;
      }
      init();
      break;

    case "ArrowDown":
      if (graphIndex < habits.length) {
        graphIndex += 1;
      }
      init();
      break;

    case "ArrowLeft":
      prevDateBtn.click();
      break;

    case "ArrowRight":
      nextDateBtn.click();
      break;

    case "c":
    case "C":
      if (habits.length === 0 || !habitItems[graphIndex - 1]) return;

      const checkbox = habitItems[graphIndex - 1].querySelector(
        'input[type="checkbox"]'
      );
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change"));
      }
      break;
  }
});
