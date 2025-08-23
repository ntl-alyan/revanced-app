export function sanitizeScript(scriptContent) {
  if (!scriptContent) return '';
  
  // Function to detect suspicious patterns that might be XSS attacks
  const containsSuspiciousPatterns = (script) => {
    // Check for potentially malicious script patterns
    const suspiciousPatterns = [
      /(on\w+\s*=)/i,                             // inline event handlers
      /(javascript\s*:)/i,                         // javascript: protocol
      /(<\s*iframe)/i,                             // iframes can be used for XSS
      /(document\.cookie)/i,                       // cookie stealing attempts
      /(\.innerHTML\s*=)/i,                        // innerHTML manipulation
      /(eval\s*\()/i,                              // eval()
      /(document\.write)/i,                        // document.write
      /(localStorage)/i,                           // localStorage access
      /(sessionStorage)/i,                         // sessionStorage access
      /(fetch\s*\(\s*['"]\/api)/i,                 // Local API fetch attempts that may try to access admin APIs
      /(XMLHttpRequest)/i,                         // XMLHttpRequest can be used for CSRF attacks
      /(new\s+Function)/i,                         // Function constructor (similar to eval)
      /(\[\s*['"].*['"]\s*\]\s*=)/i,               // Bracket notation property assignment which can be used for obfuscation
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(script));
  };
  
  // Add trusted source validation for external scripts
  const validateExternalSources = (script) => {
    // Extract all src attributes
    const srcRegex = /src\s*=\s*['"]([^'"]+)['"]/gi;
    let match;
    let modifiedScript = script;
    
    // List of trusted domains for external scripts
    const trustedDomains = [
      'googleapis.com',
      'google.com',
      'gstatic.com',
      'cloudflare.com',
      'jsdelivr.net',
      'jquery.com',
      'bootstrapcdn.com',
      'analytics.google.com',
      'googletagmanager.com',
      'unpkg.com',
      'code.jquery.com',
      'cdn.jsdelivr.net',
      'stackpath.bootstrapcdn.com',
      'fonts.googleapis.com',
      'www.googletagmanager.com',
      'cdnjs.cloudflare.com'
    ];
    
    while ((match = srcRegex.exec(script)) !== null) {
      const url = match[1];
      
      // Skip if the URL is relative
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        continue;
      }
      
      try {
        const domain = new URL(url).hostname;
        // Check if domain is trusted
        if (!trustedDomains.some(trusted => domain.endsWith(trusted))) {
          // Add data-untrusted attribute for frontend rendering decisions
          modifiedScript = modifiedScript.replace(
            `src="${url}"`,
            `src="${url}" data-untrusted="true"`
          );
        }
      } catch (error) {
        // If URL parsing fails, mark as untrusted
        modifiedScript = modifiedScript.replace(
          `src="${url}"`,
          `src="${url}" data-untrusted="true"`
        );
      }
    }
    
    return modifiedScript;
  };
  
  // Add a comment notice that this script is sanitized
  let sanitized = `<!-- This script has been sanitized by the ReVanced admin panel -->\n${scriptContent}`;
  
  // Check for suspicious patterns
  if (containsSuspiciousPatterns(scriptContent)) {
    sanitized = `<!-- SECURITY WARNING: Potentially unsafe script content has been sanitized -->\n<!-- Original script has been commented out for security reasons -->\n<!--\n${scriptContent}\n-->\n\n<!-- Please check the script content and remove any malicious code -->`;
    return sanitized;
  }
  
  // Validate external script sources
  sanitized = validateExternalSources(sanitized);
  
  // Add data-sanitized attribute
  return sanitized;
}
