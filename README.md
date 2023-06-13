# Group Manager

This is a JavaScript application that allows you to manage groups using an IndexedDB database. It provides functionalities for creating groups, shuffling numbers, revealing the next number in a group, resetting a group, removing a group, and resetting the entire system.

## Prerequisites

To run this application, make sure you have the following:

- A modern web browser that supports IndexedDB.
- jQuery library (included in the project).

## Getting Started

1. Clone the repository:

 ```shell
   git clone <repository-url>
```

Open the project in your preferred code editor.

Open the `index.html` file in a web browser.

## Usage

### Create a Group:
Enter a name for the group.
Enter the number of elements to be shuffled in the group.
Click the "Create Group" button.

### View Groups:
The created groups will be displayed in the "Groups" section.
Each group will show the group name, total count, and options to reveal the next number or reset the group.

### Reveal Next Number:
Click the "Next" button for a group to reveal the next number in the sequence.
The previously used numbers will be displayed, and the next number will be updated.

### Reset Group:
Click the "Reset" button for a group to reset it.
The group will be shuffled again, and the next number will be set to the beginning.

### Remove Group:
Click the delete button (trash can icon) for a group to remove it from the database.

### System Reset:
Click the "System Reset" button to delete all groups and reset the system.
This action is irreversible.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please create an issue or submit a pull request.

## License
This project is licensed under the MIT License.
Feel free to modify the content according to your needs, such as updating the repository URL, adding a license file, or providing additional instructions.
