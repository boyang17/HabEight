// TODO: Add daily habits (e.g., Drink Water, Read, Workout)
// TODO: Track habit completion with checkboxes (Local Storage)
// TODO: Streak counter for consistency
// TODO: Simple dashboard with progress visualization
// TODO: Responsive layout with dark mode option

/**
 * Daily Habit Tracker
 */

// DOM Elements
const dateDisplaying = document.getElementById("date-displaying");
const habitList = document.getElementById("habit-list");
const addHabitBtn = document.getElementById("add-habit-button");
const habitToAdd = document.getElementById("habit-to-add");
const prevDateBtn = document.getElementById("prev-date-btn");
const nextDateBtn = document.getElementById("next-date-btn");

// State and Data
/**
 * Example data structure for habit tracking:
 * habits = [
    {
      habit: "run",
      streak: 2,
      record: {
        "9/22/2025": true,
        "9/23/2025": true,
      },
    },
    ...
  ]
 */
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let today = new Date();

// Temporary hard coeded habits for testing
// habits = [
//   {
//     habit: "run",
//     streak: 2,
//     record: {
//       "9/22/2025": true,
//       "9/23/2025": true,
//     },
//   },
//   {
//     habit: "read",
//     streak: 0,
//     record: {
//       "9/22/2025": false,
//       "9/23/2025": false,
//     },
//   },
//   {
//     habit: "meditate",
//     streak: 2,
//     record: {
//       "9/22/2025": true,
//       "9/23/2025": true,
//     },
//   },
// ];

// Initialization
displayDate(today);
displayHabits(today);

/**
 * Displays the date on top of the habits
 * @param {Date} date
 */
function displayDate(date) {
  dateDisplaying.textContent = formatDate(date);
}

/**
 * Formats the input date into a display string
 * @param {Date} date
 * @returns {string} formatted date
 */
function formatDate(date) {
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());
  const year = date.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;
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

  habitCheckbox.addEventListener("change", () => {
    updateHabits(habitCheckbox, today);
  });

  const habitLabel = document.createElement("label");
  habitLabel.htmlFor = id;
  habitLabel.textContent = name;

  const habitItem = document.createElement("li");
  habitItem.appendChild(habitCheckbox);
  habitItem.appendChild(habitLabel);

  return habitItem;
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
    localStorage.setItem("habits", JSON.stringify(habits));
  } else if (habitCheckbox.checked === false) {
    habits.find((h) => h.habit === habitCheckbox.name)["record"][
      formatDate(date)
    ] = false;
    localStorage.setItem("habits", JSON.stringify(habits));
  }
}

// Add a click listener to add a habit to "today" and redisplay the habits with the newly added
addHabitBtn.addEventListener("click", () => {
  addHabit(today);
  displayHabits(today);
});

/**
 * Adds a new habit to the list of habbits
 * @param {Date} date the date habit is started to get tracked
 */
function addHabit(date) {
  let formattedDate = formatDate(date);
  let inputHabit = habitToAdd.value.trim();
  let habit = {
    habit: inputHabit,
    streak: 0,
    record: { [formattedDate]: false },
  };
  habits.push(habit);
  localStorage.setItem("habits", JSON.stringify(habits));
  habitToAdd.value = "";
}

prevDateBtn.addEventListener("click", () => {
  let newDate = displayTheDayBefore();

  today = newDate;
  displayDate(newDate);
  displayHabits(newDate);
});

function displayTheDayBefore() {
  let currentDateObject = new Date(dateDisplaying.textContent);
  currentDateObject.setDate(currentDateObject.getDate() - 1);
  return currentDateObject;
}
