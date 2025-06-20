# WebOS.js

An interactive web-based virtual Unix-like "operating system".

## 📌 About

WebOS.js is a minimalist yet interactive simulated "operating system", built entirely in JavaScript, designed to run directly in your web browser. It provides a command-line interface (shell) experience, allowing users to interact with a persistent virtual file system. The project aims to recreate the feel and basic functionalities of a Linux terminal environment, enabling users to explore a file structure, manipulate data, and execute basics commands.

## ✨ Key Features

  * **Virtual File System**: A comprehensive directory hierarchy (`/`, `/bin`, `/home`, `/etc`, etc.) that persists locally in the browser's storage.
  * **Command Line Interface (Shell)**: A functional terminal where you can type and execute commands as if on a real Unix-like system.
  * **Essential Commands**: Implementations of classic Unix commands such as `ls`, `cd`, `cat`, `mkdir`, `rmdir`, `cp`, `rm`, `mv`, `pwd`, `echo`, `clear`, `help`, etc.
  * **Error Handling**: Clear and specific error messages to guide the user through invalid input or unauthorized operations.
  * **Data Persistence**: All modifications to the virtual file system are automatically saved via your browser's local storage, ensuring your work persists between sessions.

## ℹ️ How to Use

### 🕹️ Basic Commands

Available commands:
```
  cat		    - concatenate files and print on the standard output
  cd		    - change the current working directory
  chmod		    - change file or directory permissions
  cls		    - clear the console screen
  cp		    - copy SOURCE to DESTINATION
  curl	       	    - transfer data from URLs
  echo		    - display a line of text
  exemple	    - exemple command
  javascript   	    - execute a JavaScript (.js) script
  ls		    - list directory contents
  mkdir		    - create a directory
  mv		    - move files and directories
  pwd		    - print the current working directory.
  reboot	    - restart the terminal session
  reset		    - reset the system to its initial state
  rm		    - remove files and directories
  rmdir		    - remove empty directories
```

### 🚀 Test WebOS.js

[Launch WebOS.js Online](https://deitsuki.netlify.app/webos.js/)

## 🛠️ Development

This project is built using:

  * **Vanilla JavaScript**: For all internal logic and interactivity.
  * **HTML5**: Structures the terminal DOM.
  * **CSS3**: Styling for an immersive terminal experience.

## 🌟 Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to open an issue or submit a pull request.
