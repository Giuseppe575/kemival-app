'use strict';
const path = require('node:path');
const { fileURLToPath } = require('node:url');

function isTrustedMainFrame(event, mainWindow, appPath) {
  try {
    return event.sender === mainWindow?.webContents && event.senderFrame === event.sender.mainFrame &&
      fileURLToPath(event.senderFrame.url) === path.join(appPath, 'index.html');
  } catch { return false; }
}
module.exports = { isTrustedMainFrame };
