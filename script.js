// TODO: Add daily habits (e.g., Drink Water, Read, Workout)
// TODO: Track habit completion with checkboxes (Local Storage)
// TODO: Streak counter for consistency
// TODO: Simple dashboard with progress visualization
// TODO: Responsive layout with dark mode option

/**
 * Daily Habit Tracker
 */

// DOM Elements
const todaysDate = document.getElementById("todays-date");
const habitList = document.getElementById("habit-list");
const addHabitBtn = document.getElementById("add-habit-button");

// State and Data
/**
 * Example data structure for habit tracking:
 * habits = [
    {
      habit: "run",
      streak: 2,
      record: {
        "9/22/2025": true,   // completed on this date
        "9/23/2025": true,
      },
    },
    ...
  ]
 */
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let currentDate = new Date();

// Temporary hard coeded habits for testing
habits = [
  {
    habit: "run",
    streak: 2,
    record: {
      "9/22/2025": true,
      "9/23/2025": true,
    },
  },
  {
    habit: "read",
    streak: 0,
    record: {
      "9/22/2025": false,
      "9/23/2025": false,
    },
  },
  {
    habit: "meditate",
    streak: 2,
    record: {
      "9/22/2025": true,
      "9/23/2025": true,
    },
  },
];

// Initialization
displayDate(currentDate);
displayHabits();

/**
 * Displays the date on top of the habits
 * @param {Date} date
 */
function displayDate(date) {
  todaysDate.textContent = formatDate(date);
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
 * Displays the habits in a list
 */
function displayHabits() {
  habits.forEach((h) => {
    let habit;
    if (formatDate(currentDate) in h["record"]) {
      habit = createHabitCheckbox(
        h["habit"],
        h["habit"],
        h["record"][formatDate(currentDate)]
      );
      console.log(habit.querySelector("input").name);
    }

    habitList.appendChild(habit);
  });
}

function updateHabits() {}

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

  const habitLabel = document.createElement("label");
  habitLabel.htmlFor = id;
  habitLabel.textContent = name;

  const habitItem = document.createElement("li");
  habitItem.appendChild(habitCheckbox);
  habitItem.appendChild(habitLabel);

  return habitItem;
}
