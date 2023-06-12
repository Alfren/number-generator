var db;
$(document).ready(() => {
  window.indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;
  var request = indexedDB.open("School_Groups");
  request.onerror = (event) => {
    console.log("Why didn't you allow my web app to use IndexedDB?!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    readDatabase();
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    var store = db.createObjectStore("Groups", { keyPath: "name" });
    store.createIndex("by_name", "name", { unique: true });
  };
});

function shuffle(number) {
  // create array of numbers of 'number' length
  let array = Array.from({ length: number }, (_, i) => i + 1),
    i = array.length,
    j = 0,
    temp;
  while (i--) {
    j = Math.floor(Math.random() * (i + 1));
    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function makeGroup() {
  let name = $("#groupName").val(),
    count = shuffle($("#groupCount").val());
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
  let group = { name, count, next: 0 };
  const store = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  store.put(group);
  readDatabase();
}

async function readDatabase() {
  $("#Groups").html("");
  $("#groupName, #groupCount").val("");
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  let groupKeys = await groups.getAllKeys();
  groupKeys.onsuccess = function () {
    if (groupKeys.result.length > 0) {
      groupKeys.result.map(async (group) => {
        groups.get(group).onsuccess = (event) => {
          createGroupOptions(event.target.result);
        };
      });
    }
  };
}

function createGroupOptions(object) {
  let id = object.name.replaceAll(" ", "_");
  let prev = "Used: ";
  object.count.forEach((num, i) => {
    if (i !== 0 && i <= object.next)
      prev += `${num}${i === object.next ? "" : ", "}`;
  });
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

function revealNext(name) {
  let id = name.replaceAll(" ", "_");
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  groups.get(name).onsuccess = (event) => {
    let item = event.target.result || {},
      count = item.count,
      next = item.next;
    if (next < count.length) {
      let prev = "Used: ";
      count.forEach((num, i) => {
        if (i <= next) prev += `${num}${i === next ? "" : ", "}`;
      });
      $(`#previous_${id}`).html(prev).css({ visibility: "visible" });
      $("#nextUp_" + id).html(
        `<span style="font-size: 2.5rem">${item.count[item.next]}</span>`
      );
      groups.put({
        name: name,
        count: item.count,
        next: item.next + 1 || item.count.length - 1,
      });
    } else {
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

function resetGroup(name) {
  let id = name.replaceAll(" ", "_");
  $(`#resetBtn_${id}`).remove();
  $(`#previous_${id}`).html("Used: ").css({ visibility: "hidden" });
  $(`#nextUp_${id}`).html('<span style="font-size: 2.5rem;">___</span>');
  $(`#groupOptions_${id}`).html(
    `<button class="btn next-btn" onClick="revealNext('${name}')">Next</button>`
  );
  let groups = db.transaction(["Groups"], "readwrite").objectStore("Groups");
  groups.get(name).onsuccess = (event) => {
    groups.put({
      name: name,
      count: shuffle(event.target.result.count.length),
      next: 0,
    });
  };
}

function removeGroup(name) {
  db.transaction(["Groups"], "readwrite").objectStore("Groups").delete(name);
  readDatabase();
}
