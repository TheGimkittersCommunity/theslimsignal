async function loadComponent(elementId, fileName, selector) {
  const container = document.getElementById(elementId);
  if (!container) return; // Exit if the placeholder isn't on this page

  try {
    // Use a leading slash / to ensure it looks at the root of your domain
    const response = await fetch('/' + fileName);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const component = doc.querySelector(selector);

    if (component) {
      container.innerHTML = component.innerHTML;
    } else {
      console.error(`Selector "${selector}" not found in ${fileName}`);
    }
  } catch (error) {
    console.error(`Failed to load ${fileName}:`, error);
  }
}
loadComponent('global-header', 'components/header.html', 'header');
