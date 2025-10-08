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
  showLimitWarning();
  spawnHabitGraphBtn();
  disableGraphBtn(graphIndex);
  showCurrentStreak(graphIndex);
  showHabitGraph(graphIndex);
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
    if (formatDate(date) in h["record"]) {
      habit = createHabitCheckbox(
        h["habit"],
        h["habit"],
        h["record"][formatDate(date)]
      );
    } else {
      h["record"][formatDate(date)] = false;
      sortDates();
      localStorage.setItem("habits", JSON.stringify(habits));
      habit = createHabitCheckbox(
        h["habit"],
        h["habit"],
        h["record"][formatDate(date)]
      );
    }
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

  habitCheckbox.addEventListener("change", () => {
    updateHabits(habitCheckbox, currentDate);
    calculateCurrentStreak();
    showHabitGraph(graphIndex);
    showCurrentStreak(graphIndex);
  });

  const habitLabel = document.createElement("label");
  habitLabel.htmlFor = id;
  habitLabel.textContent = name;
  habitLabel.style = "margin: 5px;";

  const deleteHabitBtn = document.createElement("button");
  deleteHabitBtn.id = "delete-habit-btn";
  deleteHabitBtn.title = "delete";
  deleteHabitBtn.innerHTML = `<i class="fa fa-trash-o" aria-hidden="true"></i>`;

  deleteHabitBtn.addEventListener("click", () => {
    deleteHabit(name);
    disableAddHabitBtn();
    spawnHabitGraphBtn();
    showLimitWarning();
    if (habits.length > 0) {
      disableGraphBtn(graphIndex);
      if (graphIndex > habits.length) {
        graphIndex -= 1;
        localStorage.setItem("graphIndex", graphIndex);
        showHabitGraph(graphIndex);
        disableGraphBtn(graphIndex);
        showCurrentStreak(graphIndex);
      }
    } else {
      showCurrentStreak(graphIndex);
      squares.innerHTML = "";
    }
  });

  const habitItem = document.createElement("li");
  habitItem.id = "habit-item";
  habitItem.style.display = "flex";
  habitItem.style.alignItems = "center";
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
 * as not finished
 */
function fillHabits() {
  let dateToAdd = new Date(currentDate);
  let days = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));

  if (habits.length === 0) {
    return;
  }

  for (let i = 0; i < days; i++) {
    dateToAdd.setDate(dateToAdd.getDate() + 1);
    habits.forEach((habit) => {
      if (!(formatDate(dateToAdd) in habit.record)) {
        habit["record"][formatDate(dateToAdd)] = false;
      }
    });
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
  showLimitWarning();
  spawnHabitGraphBtn();
  disableGraphBtn(graphIndex);
  showHabitGraph(graphIndex);
  showCurrentStreak(graphIndex);
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
  fillHabits();
  sortDates();
  disableNextBtn();
  showHabitGraph(graphIndex);

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
    displayStreak.innerHTML = `Current Streak:<br> N/A`;
    return;
  }

  const currentStreak = habits[index - 1]["streak"];
  displayStreak.innerHTML = `Current Streak:<br> ${currentStreak}`;
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
    color.style = `width: 10px; height: 10px;   ; display: inline-block; \
     vertical-align: middle; border-radius: 10px; \ margin-right: 0px;
     background-color: ${habitColors[i + 1]}`;

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
  let startIndex = Math.min(recordLength - 1, 59);
  daysTracked.textContent = `${startIndex + 1} days`;
  let level = 0;

  for (let i = startIndex; i >= 0; i--) {
    if (habits[habitIndex - 1].record[dates[i]] === true) {
      level = habitIndex;
    } else {
      level = 0;
    }
    squares.insertAdjacentHTML(
      "beforeend",
      `<li data-level="${level}" title="${dates[i]}"></li>`
    );
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

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

/**
 * Shows the limit warning if the habits limit is reached
 */
function showLimitWarning() {
  if (habits.length < 8) {
    limitWarning.style.display = "none";
    inputHabit.style.display = "block";
  } else {
    inputHabit.style.display = "none";
    limitWarning.style.display = "block";
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
