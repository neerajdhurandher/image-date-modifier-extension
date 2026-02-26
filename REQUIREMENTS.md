# Project requirements

## Goal
Create a Chrome/Edge extension that assists with updating image/video dates in Google Photos by injecting a script that reads metadata fields and performs guided clicks.

## Functional requirements
1. **Contextual popup**
   - When the active tab URL is `google.com`, show a **round popup** at the **bottom-right** corner of the webpage.
   - The popup should not appear on other domains.

2. **Action trigger**
   - The popup contains a button (label TBD) that, when clicked, injects a script into the page.

3. **Field discovery and reading**
   - The injected script must read field details such as **file name**, **date**, **size**, and **other relevant fields**.
   - Field lookup should use **id**, **class name**, **placeholder**, or any other optimized selector strategy.

4. **Automated clicks**
   - The injected script should perform required mouse click actions (e.g., **click the Save button**).

## Notes / Open items
- Button label is not finalized.
- Specific DOM selectors for Google Photos fields will be discovered during implementation.
