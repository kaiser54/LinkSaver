
document.addEventListener('DOMContentLoaded', function() {
  const linksContainer = document.getElementById('links-container');

  // Function to load bookmarks from local storage
  function loadBookmarks() {
    chrome.storage.local.get(['bookmarks'], function(result) {
      let bookmarks = result.bookmarks || [];

      if (bookmarks.length === 0) {
        linksContainer.innerHTML = '<p>No links saved yet.</p>';
        return;
      }

      // Loop through the bookmarks and create a link for each
      bookmarks.forEach(function(bookmark) {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';

        const link = document.createElement('a');
        link.href = bookmark.url;
        link.textContent = bookmark.title;
        link.target = '_blank';

        linkItem.appendChild(link);
        linksContainer.appendChild(linkItem);
      });
    });
  }

  // Load bookmarks when the popup is opened
  loadBookmarks();

   // Listen for changes in storage and update the popup
   chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
      if (key === 'bookmarks') {
        linksContainer.innerHTML = ''; // Clear existing links
        loadBookmarks(); // Reload bookmarks
        break;
      }
    }
  });
});

//Listen for messages from the content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "getBookmarks") {
      chrome.storage.local.get(['bookmarks'], function(result) {
        let bookmarks = result.bookmarks || [];
        sendResponse({bookmarks: bookmarks});
      });
      return true; // Required to send asynchronous response
    }
  }
);

