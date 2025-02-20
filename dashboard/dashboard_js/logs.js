import { db, collection, addDoc, getDocs, query, orderBy, writeBatch } from './firebaseConfig.js';

const logs = []; // This array will hold all log entries

export async function logAction(action, user) {
    const timestamp = new Date(); // Get current time
    const logEntry = {
        timestamp: timestamp.toLocaleString(), // Convert to Firestore Timestamp
        user: user,
        action: action
    };

    // Add the log entry to the local logs array
    logs.push(logEntry);
    
    // Display logs on the UI
    displayLogs();

    // Add the log entry to the Firestore database
    try {
        await addDoc(collection(db, "hlogs"), logEntry);
        console.log("Log entry added to Firestore");
    } catch (error) {
        console.error("Error adding log entry to Firestore: ", error);
    }
}


export async function displayLogs() {
    const logContainer = document.querySelector('.modalLogs-body');
    logContainer.innerHTML = ''; // Clear previous logs to avoid duplication

    try {
        const logsQuery = query(collection(db, "hlogs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(logsQuery);
        let logCount = 1; // Initialize log counter
        querySnapshot.forEach((doc) => {
            const log = doc.data();
            const logElement = document.createElement('div');
            logElement.classList.add('log-entry');

            // Create checkbox input for the log entry
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'log' + logCount;
            checkbox.classList.add('log-checkbox');
            checkbox.setAttribute('data-doc-id', doc.id);  // Set Firestore document ID to checkbox

            // Create a label for the checkbox
            const label = document.createElement('label');
            label.htmlFor = 'log' + logCount;
            label.textContent = `No.${logCount++} [${log.timestamp}] ${log.user}: ${log.action}`;

            // Append checkbox and label to logElement
            logElement.appendChild(checkbox);
            logElement.appendChild(label);
            logContainer.appendChild(logElement);
        });
    } catch (error) {
        console.error("Error fetching logs from Firestore: ", error);
    }
}


export async function clearModalLogs() {
    // Ensure that the clear button properly handles clearing operations
    const confirmClear = confirm("Are you sure you want to clear all history logs?");
    if (!confirmClear) {
        return; // Stop the function if the user cancels
    }

    try {
        const querySnapshot = await getDocs(collection(db, "hlogs"));
        const batch = writeBatch(db); // Create a batch write operation

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Add delete operation for each document to the batch
        });

        await batch.commit(); // Commit the batch delete operation
        console.log("All logs have been cleared from Firestore.");
        clearLogsUI(); // Also clear logs from the UI
        alert("All history logs have been cleared.");
        location.reload(); // Optional: Reload the page to refresh the state
    } catch (error) {
        console.error("Error clearing logs from Firestore: ", error);
        alert("Failed to clear history logs.");
    }
}