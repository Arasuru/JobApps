document.getElementById('saveJobBtn').addEventListener('click', async () => {
  const statusText = document.getElementById('status');
  statusText.innerText = "Parsing...";

  // Get the active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute a script on that tab to grab the page text
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText, // Grabs all visible text on the page
  }, async (injectionResults) => {
    const rawText = injectionResults[0].result;
    
    // Send it to your FastAPI backend
    try {
      const response = await fetch('http://localhost:8000/tracker/extract-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url, raw_text: rawText })
      });
      
      if (response.ok) {
        statusText.innerText = "Saved to Tracker!";
      } else {
        statusText.innerText = "Error saving job.";
      }
    } catch (err) {
      statusText.innerText = "Backend is unreachable.";
    }
  });
});