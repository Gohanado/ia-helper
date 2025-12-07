# Firefox Validation - Key Notes

## Known validation issues
The AMO validator may report JavaScript syntax errors that are **false positives**. The code runs correctly in Firefox.

### Reported files
1. **src/content/content-script.js**
   - “Unexpected token ;” or parsing errors
   - Cause: complex template literals with nested expressions
   - Status: false positive (valid ES2015+)
2. **src/chat/chat.js**
   - “Unexpected token ;” or “‘import’/‘export’ only allowed with sourceType: module”
   - Cause: ES6 modules
   - Status: false positive
3. **src/options/options.js**
   - Similar module parsing errors
   - Cause: ES6 modules
   - Status: false positive

### Why?
The validator parser struggles with ES modules (`type="module"`), complex template literals, conditional expressions inside templates, and multi-line templates. These constructs are valid ES2015+ and work in Firefox 109+.

### Technical stance
We ship native ES modules. Firefox supports this since v60, but the validator can’t always parse them. Alternatives (bundling/transpiling/refactor) either introduced new issues or added complexity, so we keep ES modules as-is.

### Verified runtime
- Firefox 140+
- Chrome 120+
- Edge 120+

### Acceptable warnings
1) **innerHTML in dom-sanitizer.js**: sanitizer utility, intentional and controlled  
2) **innerHTML in results.js**: uses sanitizer, acceptable by design

## AMO submission
1. Syntax errors from the validator can be ignored (false positives).  
2. innerHTML warnings are expected for the sanitizer.  
3. Package works despite these reports.

## Recommended pre-submit tests
1. Load the extension in Firefox dev mode.  
2. Exercise main features.  
3. Check consoles for errors.

## If AMO blocks submission
- Explain validator false positives.  
- Code is valid ECMAScript.  
- Extension tested and working.
