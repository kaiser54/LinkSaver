document.addEventListener('DOMContentLoaded', function() {
  const addLinkForm = document.getElementById('add-link-form');
  const linksContainer = document.getElementById('links-container');

  // Event listener for form submission
  addLinkForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const url = document.getElementById('url').value;
    const title = document.getElementById('title').value;

    // Check if both URL and title are provided
    if (url && title) {
      // Load existing bookmarks from storage
      chrome.storage.local.get(['bookmarks'], function(result) {
        let bookmarks = result.bookmarks || [];

        // Create a new bookmark object
        const newBookmark = { url: url, title: title };

        // Add the new bookmark to the existing array
        bookmarks.push(newBookmark);

        // Save the updated array back to storage
        chrome.storage.local.set({ 'bookmarks': bookmarks }, function() {
          // Clear the form fields after successful save
          document.getElementById('url').value = '';
          document.getElementById('title').value = '';

          // Optionally, provide feedback to the user
          console.log('Bookmark saved successfully!');
          loadBookmarks()
        });
      });
    }
  });

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

