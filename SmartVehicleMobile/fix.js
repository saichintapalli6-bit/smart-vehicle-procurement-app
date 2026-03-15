const fs = require('fs');

let text = fs.readFileSync('src/screens/AdminDashboard.js', 'utf8');

text = text.replace(/<Text style=\{styles\.actionBtnText\}>.*?Verify.*?<\/Text>/g, '<Text style={styles.actionBtnText}>🔍 Verify</Text>');
text = text.replace(/<Text style=\{styles\.modalTitle\}>.*?Transaction Verification.*?<\/Text>/g, '<Text style={styles.modalTitle}>🔍 Transaction Verification</Text>');
text = text.replace(/\{buyerTxn \|\| '.*?Buyer did not provide Transaction ID'\}/g, "{buyerTxn || '❌ Buyer did not provide Transaction ID'}");
text = text.replace(/\{sellerTxn \|\| '.*?Seller has not entered TXN ID yet'\}/g, "{sellerTxn || '⏳ Seller has not entered TXN ID yet'}");
text = text.replace(/\? '.*?Waiting for both parties to provide their TXN IDs'/g, "? '⏳ Waiting for both parties to provide their TXN IDs'");

// Also let's fix the ₹‚¹ which was incorrectly replaced earlier
text = text.replace(/₹‚¹/g, '₹');

fs.writeFileSync('src/screens/AdminDashboard.js', text, 'utf8');
console.log('Fixed successfully');
