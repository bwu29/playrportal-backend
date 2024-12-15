// Change from ES6 export to CommonJS
exports.COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Burkina Faso", 
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
  "Chad", "Chile", "China PR", "Chinese Taipei", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "DR Congo", "Denmark", 
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", 
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Haiti", "Honduras", 
  "Hong Kong", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kosovo", "Kuwait", 
  "Kyrgyz Republic", "Latvia", "Lebanon", "Liberia", "Libya", "Liechtenstein", 
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", 
  "Malta", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Morocco", 
  "Mozambique", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", 
  "Niger", "Nigeria", "North Macedonia", "Northern Ireland", "Norway", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Puerto Rico", "Qatar", "Republic of Ireland", "Rwanda", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Senegal", "Serbia", 
  "Seychelles", "Sierra Leone", "Singapore", "Solomon Islands", "South Africa", 
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", 
  "Switzerland", "Syria", "Tanzania", "Tonga", "Trinidad and Tobago", "Tunisia", 
  "Tuvalu", "Uganda", "United Arab Emirates", "United States", "Uruguay", "Vanuatu", 
  "Venezuela", "Vietnam", "Wales", "Zambia", "Zimbabwe"
];

exports.POSITIONS = ["CF", "LF", "RF", "ACM", "DCM", "LCB", "RCB", "LWB", "RWB", "GK"];

exports.PRO_EXPERIENCE = ["0", "1", "2", "3", "4-6", "7-9", "10+"];

exports.AVAILABILITY = [
  "Free Agent",
  "Contract Ending in Winter 2024",
  "Contract Ending in Summer 2025",
  "Contract Ending in Winter 2025",
  "Contract Ending in Summer 2026",
  "Contract Ending in Winter 2026",
  "Contract ending in Summer 2027"
];

exports.BIRTH_YEARS = Array.from({ length: 2010 - 1984 + 1 }, (_, i) => 2010 - i);
