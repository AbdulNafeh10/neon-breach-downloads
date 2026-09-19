// A separate clock keeps authoritative timers progressing when rendering is throttled.
setInterval(()=>postMessage(Date.now()),50);
