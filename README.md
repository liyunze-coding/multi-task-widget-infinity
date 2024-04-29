# Multi-Task widget Infinity (PRIVATE)

![Multi Task Widget](./images/preview.png "Multi-Task widget")

It's basically the same as the original "Multi-Task widget" but with infinite scroll! (more aesthetic, hehe)

## Logs

---

I'll just update you guys on the Discord

---

<!-- directory -->

## Content

- [Multi-Task widget Infinity (PRIVATE)](#multi-task-widget-infinity-private)
  - [Logs](#logs)
  - [Content](#content)
  - [Installation](#installation)
    - [Note for YouTube Streamers:](#note-for-youtube-streamers)
  - [Customization settings](#customization-settings)
    - [settings](#settings)
    - [task list styles](#task-list-styles)
    - [header](#header)
    - [body](#body)
    - [task](#task)
  - [Credits](#credits)

---

## Installation

1.  Install [Streamer.bot](https://streamer.bot/)

2.  Follow instruction video [HERE](https://youtu.be/CcXAs-qZ0Ys?t=116) on how to setup Streamer.bot \(until 5:43 timestamp\)

3.  Import StreamerBot Files `StreamerBotImport` as shown in this [VIDEO](https://youtu.be/eXn2zCu0k6k?t=298)

    -   set Auto Connect to Checked (recommended)

4.  On StreamerBot, go to `Servers/Clients` > `Websocket Server`, and change to the following settings

    ![Websocket server settings](images/websocket_settings.png)

    -   Auto Start: `Checked`
    -   Address: `127.0.0.1`
    -   Port: `6968`
    -   Endpoint: `/`
    -   `Start Server`

5.  Setup `Browser Source` in OBS studio or other streaming software with the following settings:

-   Local File: `checked`
-   Browse to `index.html`

### Note for YouTube Streamers:
- If you're adding an alt account as a bot, be sure to set alt account as moderator (/moderator @alt_account)
- If there's some errors, try creating a channel for the alt account

---

## Customization settings

Edit `configs.js` to edit the style of the task list

![Labels](./images/labels.png "Labels")

---

### settings

`showDoneTasks`:

**true**: show the done tasks

**false**: hide (and remove) the done tasks

`enableLimit`:

**true**: limit the number of incomplete tasks stored in the list

**false**: unlimited incomplete tasks

`limit`: The number of incomplete tasks to store in the list (integer)

`OneScrollPerMS`: Per MS, how many pixels to scroll (integer)

`pauseBetweenScrolls`: How many MS to pause between each end of the scroll (integer)

### task list styles

`taskListWidth`: width of the task list (px)

`taskListHeight`: height of the task list (px)

`taskListBackgroundColor`: background color of the task list (hex only)

`taskListBackgroundOpacity`: opacity of the task list background (0.0 - 1.0)

`taskListBorderWidth`: width of the task list border (px)

`taskListBorderColor`: color of the task list border (hex or name)

`taskListBorderRadius`: how round the task list border should be (px)

`taskListHorizontalPadding`: horizontal padding of the task list (px)

`taskListVerticalPadding`: vertical padding of the task list (px)

### header

`headerBackgroundColor`: background color of the header (hex only)

`headerBackgroundOpacity`: opacity of the header background (0.0 - 1.0)

`headerBorderWidth`: width of the header border (px)

`headerBorderColor`: color of the header border (hex or name)

`headerBorderRadius`: how round the header border should be (px)

`headerFontFamily`: font family of the header (font name)

`headerGoogleFont`: whether to use Google font for the header (true or false)

`headerFontSize`: font size of the header (px)

`headerFontWeight`: font weight of the header (normal, bold, or number)

`headerFontColor`: font color of the header (hex or name)

### body

`bodyBackgroundColor`: background color of the body (hex only)

`bodyBackgroundOpacity`: opacity of the body background (0.0 - 1.0)

`bodyBorderWidth`: width of the body border (px)

`bodyBorderColor`: color of the body border (hex or name)

`bodyBorderRadius`: how round the body border should be (px)

### task

`lineHeight`: line height of the task (number)

`usernameFontWeight`: font weight of the username (normal, bold, or number)

`usernameColor`: color of the username (hex or name or "" for Twitch user color)

`taskBackgroundColor`: background color of the task (hex only)

`taskBackgroundOpacity`: opacity of the task background (0.0 - 1.0)

`taskFontFamily`: font family of the task (font name)

`taskGoogleFont`: whether to use Google font for the task (true or false)

`taskFontSize`: font size of the task (px)

`taskFontColor`: font color of the task (hex or name)

`taskBorderColor`: color of the task border (hex or name)

`taskBorderWidth`: width of the task border (px)

`taskBorderRadius`: how round the task border should be (px)

`taskMarginBottom`: bottom margin of the task (px)

`taskHorizontalPadding`: horizontal padding of the task (px)

`taskVerticalPadding`: vertical padding of the task (px)

---

## Credits

**Author:** [**@RyanPython**](https://twitch.tv/RyanPython)

**Special thanks to:**

-   [**@Instafluff**](https://twitch.tv/Instafluff) \(for the Comfy JS library\)
