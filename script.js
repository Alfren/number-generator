/**
 * Initializes an IndexedDB database named "School_Groups" and performs necessary operations.
 */
var db;
$(document).ready(() => {
  // Check for different browser-specific implementations of IndexedDB
  window.indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;
    
  // Open the "School_Groups" database
  var request = indexedDB.open("School_Groups");
  
  // Event handler for errors that occur during the request
  request.onerror = (event) => {
    console.log("Why didn't you allow my web app to use IndexedDB?!");
  };

  // Event handler for successful database opening
  request.onsuccess = (event) => {
    // Set the global variable 'db' to the opened database
    db = event.target.result;
    
    // Read the database contents
    readDatabase();
  };

  // Event handler for database upgrade (executed if the database version is lower than the specified version)
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    
    // Create an object store named "Groups" with a keyPath of "name"
    var store = db.createObjectStore("Groups", { keyPath: "name" });
    
    // Create an index named "by_name" on the "name" property with unique values
    store.createIndex("by_name", "name", { unique: true });
  };
});

/**
 * Shuffles an array of numbers.
 * @param {number} number - The length of the array to be shuffled.
 * @returns {number[]} - The shuffled array.
 */
function shuffle(number) {
  let array = Array.from({ length: number }, (_, i) => i + 1),
    i = array.length,
    j = 0,
    temp;
    
  while (i--) {
    j = Math.floor(Math.random() * (i + 1));
    
    // Swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  
  return array;
}

/**
 * Creates a new group in the database based on the provided input.
 */
function makeGroup() {
  let name = $("#groupName").val(),
    count = shuffle($("#groupCount").val());
    
  // Validate input fields
  if (name == "") {
    $("#groupName").css({ backgroundColor: "pink" });
    setTimeout(() => {
      $("#groupName").css({ backgroundColor: "" });
    }, 2000);
    return 0;
  }
  
  if (count.length === 0) {
    $("#groupCount").css({ backgroundColor: "pink" });
    setTimeout(() => {
      $("#groupCount").css({ backgroundColor: "" });
    }, 2000);
    return 0;
  }
  
  // Create a group object
  let group = { name, count, next: 0 };
  
  // Access the "Groups" object store in the database
  const store = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  
  // Add the group to the object store
  store.put(group);
  
  // Read the updated database contents
  readDatabase();
}

/**
 * Reads the contents of the "Groups" object store in the database.
 */
async function readDatabase() {
  // Clear the groups section in the HTML
  $("#Groups").html("");
  $("#groupName, #groupCount").val("");
  
  // Access the "Groups" object store in the database
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  
  // Get all the keys in the object store
  let groupKeys = await groups.getAllKeys();
  
  // Event handler for successful retrieval of keys
  groupKeys.onsuccess = function () {
    if (groupKeys.result.length > 0) {
      // Process each group asynchronously
      groupKeys.result.map(async (group) => {
        groups.get(group).onsuccess = (event) => {
          createGroupOptions(event.target.result);
        };
      });
    }
  };
}

/**
 * Creates the group options section in the HTML for a specific group object.
 * @param {object} object - The group object containing name, count, and next properties.
 */
function createGroupOptions(object) {
  let id = object.name.replaceAll(" ", "_");
  let prev = "Used: ";
  
  // Generate the string for previously used numbers
  object.count.forEach((num, i) => {
    if (i !== 0 && i <= object.next)
      prev += `${num}${i === object.next ? "" : ", "}`;
  });
  
  // Append the group options HTML to the "Groups" section
  $("#Groups").append(`
      <details id="selectedGroup_${id}" style="margin-top:5px;" open>
        <summary>
          <div style="width:77.5px;"></div><h4 class="text-center">${
            object.name
          } • ${object.count.length}</h4>
          <button onClick="removeGroup('${object.name}')" class="btn deleteBtn">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:35px; transform: translateY(3px);" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </summary>
        <p id="previous_${id}" class="text-center" style="margin: 0 auto;${
    prev == "Used: " ? "visibility: hidden;" : ""
  }">${prev}</p>
        <h4 class="text-center">Up Next<br/><span id="nextUp_${id}"><span style="font-size: 2.5rem;">${
    object.next
      ? object.count[
          object.next ? parseInt(object.next) - 1 : parseInt(object.next)
        ]
      : "___"
  }</span></span></h4>
        <div class="text-center" id="groupOptions_${id}">
          ${
            object.count.length === object.next
              ? `<button class="btn next-btn" id="resetBtn_${id}" onclick="resetGroup('${object.name}')">Reset</button>`
              : `<button class="btn next-btn" onClick="revealNext('${object.name}')">Next</button>`
          }
        </div>
      </details>
    `);
}

/**
 * Reveals the next number in the group and updates the database.
 * @param {string} name - The name of the group.
 */
function revealNext(name) {
  let id = name.replaceAll(" ", "_");
  
  // Access the "Groups" object store in the database
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  
  // Get the group object from the object store
  groups.get(name).onsuccess = (event) => {
    let item = event.target.result || {},
      count = item.count,
      next = item.next;
      
    if (next < count.length) {
      let prev = "Used: ";
      
      // Generate the string for previously used numbers
      count.forEach((num, i) => {
        if (i <= next) prev += `${num}${i === next ? "" : ", "}`;
      });
      
      // Update the previous and next number in the HTML
      $(`#previous_${id}`).html(prev).css({ visibility: "visible" });
      $("#nextUp_" + id).html(
        `<span style="font-size: 2.5rem">${item.count[item.next]}</span>`
      );
      
      // Update the next property of the group object and put it back in the object store
      groups.put({
        name: name,
        count: item.count,
        next: item.next + 1 || item.count.length - 1,
      });
    } else {
      // Update the next number in the HTML and add the reset button if necessary
      $("#nextUp_" + id).html(
        `<span style="font-size: 2.5rem;">${
          item.count[count.length - 1]
        }</span>`
      );
      
      if (!$(`#resetBtn_${id}`).length) {
        $("#groupOptions_" + id).html(
          `<button class="btn next-btn" id="resetBtn_${id}" onclick="resetGroup('${name}')">Reset</button>`
        );
      }
    }
  };
}

/**
 * Resets the group by shuffling the numbers and setting the next property to 0.
 * @param {string} name - The name of the group.
 */
function resetGroup(name) {
  let id = name.replaceAll(" ", "_");
  
  // Remove the reset button from the HTML and reset the previous and next numbers
  $(`#resetBtn_${id}`).remove();
  $(`#previous_${id}`).html("Used: ").css({ visibility: "hidden" });
  $(`#nextUp_${id}`).html('<span style="font-size: 2.5rem;">___</span>');
  $(`#groupOptions_${id}`).html(
    `<button class="btn next-btn" onClick="revealNext('${name}')">Next</button>`
  );
  
  // Access the "Groups" object store in the database
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  
  // Get the group object from the object store and shuffle the numbers
  groups.get(name).onsuccess = (event) => {
    groups.put({
      name: name,
      count: shuffle(event.target.result.count.length),
      next: 0,
    });
  };
}

/**
 * Removes a group from the database.
 * @param {string} name - The name of the group to be removed.
 */
function removeGroup(name) {
  db.transaction(["Groups"], "readwrite").objectStore("Groups").delete(name);
  readDatabase();
}

/**
 * Resets the system by deleting the "School_Groups" database and reloading the page.
 */
function systemReset() {
  if (
    confirm(`Reset system and remove all groups?\n\nClick "OK" to continue`)
  ) {
    window.indexedDB.deleteDatabase("School_Groups");
    window.location.replace(window.location.href);
  }
}
