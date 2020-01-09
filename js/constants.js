// export const rcplBase = "https://www.richlandlibrary.com";
// export const rcplBase = 'https://staging-richland-site.pantheonsite.io';
// export const rcplBase = 'http://localvm.richland-site.com';

// Use current hostname so this will work across local, dev, and prod.
export const rcplBase = window.location.protocol + '//' + window.location.hostname;
